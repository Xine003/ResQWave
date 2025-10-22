const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { AppDataSource } = require("../config/dataSource");

const adminRepo = AppDataSource.getRepository("Admin");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const loginVerificationRepo = AppDataSource.getRepository("LoginVerification");
const focalRepo = AppDataSource.getRepository("FocalPerson"); // ensure focalLogin works

// Registration
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // check if already exists
        const existingAdmin = await adminRepo.findOne({ where: [
            { name },
            { email }
        ] });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this name or email already exists" });
        }

        // Get the last admin
        const lastAdmin = await adminRepo
            .createQueryBuilder("admin")
            .orderBy("admin.id", "DESC")
            .getOne();

        let newNumber = 1;
        if (lastAdmin) {
            const lastNumber = parseInt(lastAdmin.id.replace("ADM", ""), 10);
            newNumber = lastNumber + 1;
        }

        const newID = "ADM" + String(newNumber).padStart(3, "0");

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = adminRepo.create({
            id: newID,
            name,
            email,
            password: hashedPassword,
        });

        await adminRepo.save(newAdmin);

        // Return the new admin's id
        res.status(201).json({ message: "Admin Registered Successfully", id: newAdmin.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


// Focal Person Login
const focalLogin = async (req, res) => {
    try {
        const { emailOrNumber, password } = req.body;
        if (!emailOrNumber || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const focal = await focalRepo.findOne({
            where: [
                { email: emailOrNumber },
                { contactNumber: emailOrNumber }
            ]
        });
        if (!focal) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        if (!focal.password) {
            return res.status(501).json({ message: "Focal Person password not set. Please add password field to model." });
        }

        const isMatch = await bcrypt.compare(password, focal.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate Code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

        // Save to Login Verification
        const verification = loginVerificationRepo.create({
            userID: focal.id,
            userType: "focalPerson",
            code,
            expiry
        });
        await loginVerificationRepo.save(verification);

        // Send OTP via Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });

        await transporter.sendMail({
            from: `"ResQWave" <${process.env.EMAIL_USER}>`,
            to: focal.email,
            subject: "ResQWave 2FA Verification",
            text: `Your login verification is ${code}. It  will expire in 5 Minutes`
        });

        // For dev only, log code
        console.log(`🔑 2FA code for ${focal.id}: ${code}`);
        const tempToken = jwt.sign(
            { id: focal.id, role: "focalPerson", step: "2fa" },
            process.env.JWT_SECRET,
            { expiresIn: "5m" } // only valid for a short time
        );

        res.json({ message: "Verification Send to Email", tempToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


// COMBINED 2FA LOGIN (Auto-detect Admin | Dispatcher)
const adminDispatcherLogin = async (req, res) => {
    try {
        const { emailOrNumber, password } = (req.body || {});
        const identifier = String(emailOrNumber || "").trim();

        if (!identifier || !password) {
            return res.status(400).json({ message: "emailOrNumber and password are required" });
        }

        let role = null;
        let user = null;
        let recipientEmail = null;

    // Try Admin by name (admin enters their name into emailOrNumber)
    const admin = await adminRepo.findOne({ where: { name: identifier } });
    if (admin && await bcrypt.compare(password, admin.password || "")) {
      role = "admin";
      user = admin;
      recipientEmail = admin.email;
    }

        // If not admin, try Dispatcher by email or contactNumber
        if (!user) {
            const dispatcher = await dispatcherRepo.findOne({
                where: [{ email: identifier }, { contactNumber: identifier }],
            });
            if (dispatcher && await bcrypt.compare(password, dispatcher.password || "")) {
                role = "dispatcher";
                user = dispatcher;
                recipientEmail = dispatcher.email;
            }
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Clean previous OTPs for this user
        await loginVerificationRepo.delete({ userID: user.id, userType: role });

        // Generate and save OTP
        const code = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);
        await loginVerificationRepo.save({ userID: user.id, userType: role, code, expiry });

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false }
        });
        await transporter.sendMail({
            from: `"ResQWave" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: "ResQWave Login Verification Code",
            text: `Your verification code is ${code}. It expires in 5 minutes.`,
        });

        console.log(` 2FA code: ${code}`);
        const tempToken = jwt.sign(
            { id: user.id, role, step: "2fa" },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        return res.json({ message: "Verification code sent", tempToken });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error - LOGIN 2FA" });
    }
};

// COMBINED 2FA VERIFY (Admin | Dispatcher)
const adminDispatcherVerify = async (req, res) => {
    try {
        const { tempToken, code } = (req.body || {});
        if (!tempToken || !code) {
            return res.status(400).json({ message: "tempToken and code are required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ message: "Invalid or expired temp token" });
        }
        if (decoded.step !== "2fa" || !["admin", "dispatcher"].includes(decoded.role)) {
            return res.status(400).json({ message: "Invalid token context" });
        }


    // Create session (so logout can invalidate)
    const sessionID = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await loginVerificationRepo.save({
      userID: decoded.id,
      userType: decoded.role,
      code: "OK",
      sessionID,
      expiry: sessionExpiry,
    });

    // Cleanup used OTP
    await loginVerificationRepo.delete({ userID: decoded.id, userType: decoded.role, code });

    // Get user data for response
    let userData = null;
    if (decoded.role === "admin") {
      const admin = await adminRepo.findOne({ where: { id: decoded.id } });
      userData = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      };
    } else {
      const dispatcher = await dispatcherRepo.findOne({ where: { id: decoded.id } });
      userData = {
        id: dispatcher.id,
        name: dispatcher.name,
        email: dispatcher.email,
        phoneNumber: dispatcher.phoneNumber,
        role: "dispatcher"
      };
    }

    const token = jwt.sign(
      { id: decoded.id, role: decoded.role, name: userData.name, sessionID },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ 
      message: "Login successful", 
      token,
      user: userData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - VERIFY 2FA" });
  }
};

// Logout
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No Token" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.sessionID) {
            await loginVerificationRepo.delete({ sessionID: decoded.sessionID });
        }

        res.json({ message: "Logged Out Succesfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    register,
    focalLogin,
    logout,
    adminDispatcherLogin,
    adminDispatcherVerify,
};
