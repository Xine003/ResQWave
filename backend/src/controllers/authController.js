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
    const existingAdmin = await adminRepo.findOne({
      where: [
        { name },
        { email }
      ]
    });
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
      // If password is 'dummy', just return not locked
      if (password === 'dummy') {
        return res.json({ locked: false });
      }
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // If password is 'dummy', only return lockout status, do not increment failedAttempts
    if (password === 'dummy') {
      if (focal.lockUntil && new Date(focal.lockUntil) > new Date()) {
        return res.json({ locked: true, message: "Your account is temporarily locked due to too many failed attempts.", lockUntil: focal.lockUntil });
      } else {
        return res.json({ locked: false });
      }
    }

    // Check if the Account is Locked
    let locked = false;
    let lockUntil = null;
    if (focal.lockUntil && new Date(focal.lockUntil) > new Date()) {
      locked = true;
      lockUntil = focal.lockUntil;
    }

    // Compate Password
    const isMatch = await bcrypt.compare(password, focal.password || "");
    if (!isMatch) {
      focal.failedAttempts = (focal.failedAttempts || 0) + 1;
      // Lock the Accont After 5 Failed Attempts
      if (focal.failedAttempts >= 5) {
        focal.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 Minutes
        await focalRepo.save(focal);
        // Still allow navigation to verification page, but indicate locked
      } else {
        await focalRepo.save(focal);
      }
      // Always return tempToken and lock status for navigation
      var focalTempToken = jwt.sign(
        { id: focal.id, role: "focalPerson", step: "2fa" },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      return res.json({
        message: locked ? `Account Locked. Try again in 15 Minutes` : `Invalid Credentials. Attempts ${focal.failedAttempts}/5`,
        tempToken: focalTempToken,
        locked,
        lockUntil
      });
    }

    // Do NOT reset failedAttempts or lockUntil on successful login
    // Only reset after successful OTP verification

    // Generate Code
    var focalCode = crypto.randomInt(100000, 999999).toString();
    var focalExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

    // Save to Login Verification
    var focalVerification = loginVerificationRepo.create({
      userID: focal.id,
      userType: "focalPerson",
      code: focalCode,
      expiry: focalExpiry
    });
    await loginVerificationRepo.save(focalVerification);

    // Send OTP via Email
    var focalTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    await focalTransporter.sendMail({
      from: `"ResQWave" <${process.env.EMAIL_USER}>`,
      to: focal.email,
      subject: "ResQWave 2FA Verification",
      text: `Your login verification is ${focalCode}. It  will expire in 5 Minutes`
    });

    // For dev only, log code
    console.log(`🔑 2FA code for ${focal.id}: ${focalCode}`);
    var focalTempToken = jwt.sign(
      { id: focal.id, role: "focalPerson", step: "2fa" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({ message: "Verification Send to Email", tempToken: focalTempToken, locked, lockUntil });

    // If not admin, try Dispatcher
    if (!user) {
      const dispatcher = await dispatcherRepo.findOne({
        where: [{ email: identifier }, { contactNumber: identifier }],
      });

      if (dispatcher) {
        // Check if locked
        if (dispatcher.lockUntil && dispatcher.lockUntil > new Date()) {
          const remaining = Math.ceil((dispatcher.lockUntil - new Date()) / 60000);
          return res.status(403).json({ message: `Account Locked. Try again in ${remaining} Minutes` });
        }

        const isMatch = await bcrypt.compare(password, dispatcher.password || "");
        if (!isMatch) {
          dispatcher.failedAttempts = (dispatcher.failedAttempts || 0) + 1;

          if (dispatcher.failedAttempts >= 5) {
            dispatcher.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            await dispatcherRepo.save(dispatcher);
            return res.status(403).json({ message: "Too Many Failed Attempts" });
          }

          await dispatcherRepo.save(dispatcher);
          return res.status(400).json({ message: `Invalid Credentials. Attempts left: ${dispatcher.failedAttempts}/5` });
        }

        // Reset Attempts on Success
        dispatcher.failedAttempts = 0;
        dispatcher.lockUntil = null;
        await dispatcherRepo.save(dispatcher);

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


// Focal Person OTP Verification
const verifyFocalLogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body || {};
    if (!tempToken || !code) {
      return res.status(400).json({ message: "tempToken and code are required" });
    }
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired temp token" });
    }
    if (decoded.step !== "2fa" || decoded.role !== "focalPerson") {
      return res.status(400).json({ message: "Invalid token context" });
    }
    const focal = await focalRepo.findOne({ where: { id: decoded.id } });
    if (!focal) {
      return res.status(404).json({ message: "Focal Person Not Found" });
    }
    // Check if locked
    if (focal.lockUntil && new Date(focal.lockUntil) > new Date()) {
      const remaining = Math.ceil((new Date(focal.lockUntil) - new Date()) / 60000);
      return res.status(400).json({ locked: true, message: `Account Locked. Try again in ${remaining} Minutes`, lockUntil: focal.lockUntil });
    }
    // Find OTP session
    const otpSession = await loginVerificationRepo.findOne({ where: { userID: focal.id, userType: "focalPerson", code } });
    if (!otpSession || (otpSession.expiry && new Date() > new Date(otpSession.expiry))) {
      // Increment failedAttempts
      focal.failedAttempts = (focal.failedAttempts || 0) + 1;
      if (focal.failedAttempts >= 5) {
        focal.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await focalRepo.save(focal);
        return res.status(400).json({ locked: true, message: "Too many failed attempts. Account locked.", lockUntil: focal.lockUntil });
      }
      await focalRepo.save(focal);
      return res.status(400).json({ message: `Invalid or expired code. Attempts ${focal.failedAttempts}/5` });
    }
    // Success: reset failedAttempts, clear lock, delete OTP session
    focal.failedAttempts = 0;
    focal.lockUntil = null;
    await focalRepo.save(focal);
    await loginVerificationRepo.delete({ userID: focal.id, userType: "focalPerson", code });
    // Create session token (optional, for future use)
    const sessionID = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await loginVerificationRepo.save({ userID: focal.id, userType: "focalPerson", code: "OK", sessionID, expiry: sessionExpiry });
    const token = jwt.sign(
      { id: focal.id, role: "focalPerson", name: focal.name, sessionID },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    return res.json({ message: "Login successful", token, user: { id: focal.id, name: focal.name, email: focal.email, role: "focalPerson" } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - VERIFY Focal 2FA" });
  }
};

const adminDispatcherLogin = async (req, res) => {
  try {
    const { emailOrNumber, password } = (req.body || {});
    const identifier = String(emailOrNumber || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    let role = null;
    let user = null;
    let recipientEmail = null;

    // Try Admin by name (admin enters their name into emailOrNumber)
    const admin = await adminRepo.findOne({ where: { name: identifier } });
    if (admin) {
      // Check if locked
      if (admin.lockUntil && new Date(admin.lockUntil) > new Date()) {
        const remaining = Math.ceil((new Date(admin.lockUntil) - new Date()) / 60000);
        return res.status(403).json({ message: `Account Locked. Try again in ${remaining} Minutes` });
      }
      const isMatch = await bcrypt.compare(password, admin.password || "");
      if (!isMatch) {
        admin.failedAttempts = (admin.failedAttempts || 0) + 1;
        if (admin.failedAttempts >= 5) {
          admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          await adminRepo.save(admin);
          return res.status(403).json({ message: "Too Many Failed Attempts" });
        }
        await adminRepo.save(admin);
        return res.status(400).json({ message: `Invalid Credentials. Attempts left: ${admin.failedAttempts}/5` });
      }
      // Reset Attempts on Success
      admin.failedAttempts = 0;
      admin.lockUntil = null;
      await adminRepo.save(admin);
      role = "admin";
      user = admin;
      recipientEmail = admin.email;
    }

    // If not admin, try Dispatcher
    if (!user) {
      const dispatcher = await dispatcherRepo.findOne({ where: [{ email: identifier }, { contactNumber: identifier }] });
      if (dispatcher) {
        // Check if locked
        if (dispatcher.lockUntil && new Date(dispatcher.lockUntil) > new Date()) {
          const remaining = Math.ceil((new Date(dispatcher.lockUntil) - new Date()) / 60000);
          return res.status(403).json({ message: `Account Locked. Try again in ${remaining} Minutes` });
        }
        const isMatch = await bcrypt.compare(password, dispatcher.password || "");
        if (!isMatch) {
          dispatcher.failedAttempts = (dispatcher.failedAttempts || 0) + 1;
          if (dispatcher.failedAttempts >= 5) {
            dispatcher.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            await dispatcherRepo.save(dispatcher);
            return res.status(403).json({ message: "Too Many Failed Attempts" });
          }
          await dispatcherRepo.save(dispatcher);
          return res.status(400).json({ message: `Invalid Credentials. Attempts left: ${dispatcher.failedAttempts}/5` });
        }
        // Reset Attempts on Success
        dispatcher.failedAttempts = 0;
        dispatcher.lockUntil = null;
        await dispatcherRepo.save(dispatcher);
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
      { expiresIn: "8h" }
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

// Get Current User (Token Validation)
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid Token Format" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or Expired Token" });
    }

    // Verify session is still active (if sessionID exists)
    if (decoded.sessionID) {
      const session = await loginVerificationRepo.findOne({
        where: { sessionID: decoded.sessionID }
      });

      if (!session) {
        return res.status(401).json({ message: "Session Expired" });
      }

      // Check if session has expired
      if (session.expiry && new Date() > new Date(session.expiry)) {
        await loginVerificationRepo.delete({ sessionID: decoded.sessionID });
        return res.status(401).json({ message: "Session Expired" });
      }
    }

    // Get user data based on role
    let userData = null;
    if (decoded.role === "admin") {
      const admin = await adminRepo.findOne({ where: { id: decoded.id } });
      if (!admin) {
        return res.status(404).json({ message: "Admin Not Found" });
      }
      userData = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      };
    } else if (decoded.role === "dispatcher") {
      const dispatcher = await dispatcherRepo.findOne({ where: { id: decoded.id } });
      if (!dispatcher) {
        return res.status(404).json({ message: "Dispatcher Not Found" });
      }
      userData = {
        id: dispatcher.id,
        name: dispatcher.name,
        email: dispatcher.email,
        role: "dispatcher"
      };
    } else if (decoded.role === "focalPerson") {
      const focal = await focalRepo.findOne({ where: { id: decoded.id } });
      if (!focal) {
        return res.status(404).json({ message: "Focal Person Not Found" });
      }
      userData = {
        id: focal.id,
        name: focal.name,
        email: focal.email,
        role: "focalPerson"
      };
    } else {
      return res.status(400).json({ message: "Invalid User Role" });
    }

    res.json({ user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Resend Focal Login OTP
const resendFocalLoginCode = async (req, res) => {
  try {
    const { tempToken, emailOrNumber } = req.body || {};

    let focal = null;

    if (tempToken) {
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (decoded.step !== "2fa" || decoded.role !== "focalPerson") {
          return res.status(400).json({ message: "Invalid token context" });
        }
        focal = await focalRepo.findOne({ where: { id: decoded.id } });
      } catch {
        return res.status(401).json({ message: "Invalid or expired temp token" });
      }
    } else {
      const identifier = String(emailOrNumber || "").trim();
      if (!identifier) return res.status(400).json({ message: "emailOrNumber is required" });
      focal = await focalRepo.findOne({
        where: [{ email: identifier }, { contactNumber: identifier }],
      });
    }

    if (!focal) return res.status(404).json({ message: "Focal Person Not Found" });

    // Generate new code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // Replace any pending OTP for this user
    await loginVerificationRepo.delete({ userID: focal.id, userType: "focalPerson" });
    await loginVerificationRepo.save({ userID: focal.id, userType: "focalPerson", code, expiry });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: `"ResQWave" <${process.env.EMAIL_USER}>`,
      to: focal.email,
      subject: "ResQWave 2FA Verification (Resend)",
      text: `Your login verification code is ${code}. It expires in 5 minutes.`,
    });

    // Return a fresh temp token for the new code window
    const newTempToken = jwt.sign(
      { id: focal.id, role: "focalPerson", step: "2fa" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.json({ message: "Verification Resent", tempToken: newTempToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - RESEND Focal 2FA" });
  }
};

// Resend Admin/Dispatcher OTP 
const resendAdminDispatcherCode = async (req, res) => {
  try {
    const { tempToken, emailOrNumber } = req.body || {};

    let role = null;
    let user = null;
    let recipientEmail = null;

    if (tempToken) {
      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      } catch {
        return res.status(401).json({ message: "Invalid or expired temp token" });
      }
      if (decoded.step !== "2fa" || !["admin", "dispatcher"].includes(decoded.role)) {
        return res.status(400).json({ message: "Invalid token context" });
      }
      role = decoded.role;

      if (role === "admin") {
        user = await adminRepo.findOne({ where: { id: decoded.id } });
        recipientEmail = user?.email || null;
      } else {
        user = await dispatcherRepo.findOne({ where: { id: decoded.id } });
        recipientEmail = user?.email || null;
      }
    } else {
      const identifier = String(emailOrNumber || "").trim();
      if (!identifier) return res.status(400).json({ message: "emailOrNumber is required" });

      // Try Admin by name first (matches your login flow)
      const admin = await adminRepo.findOne({ where: { name: identifier } });
      if (admin) {
        role = "admin";
        user = admin;
        recipientEmail = admin.email;
      } else {
        const dispatcher = await dispatcherRepo.findOne({
          where: [{ email: identifier }, { contactNumber: identifier }],
        });
        if (dispatcher) {
          role = "dispatcher";
          user = dispatcher;
          recipientEmail = dispatcher.email;
        }
      }
    }

    if (!user || !role) {
      return res.status(404).json({ message: "User not found for resend" });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await loginVerificationRepo.delete({ userID: user.id, userType: role });
    await loginVerificationRepo.save({ userID: user.id, userType: role, code, expiry });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: `"ResQWave" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: "ResQWave Login Verification Code (Resend)",
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
    });

    const newTempToken = jwt.sign(
      { id: user.id, role, step: "2fa" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.json({ message: "Verification Resent", tempToken: newTempToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - RESEND Admin/Dispatcher 2FA" });
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
  resendFocalLoginCode,
  verifyFocalLogin,
  resendAdminDispatcherCode,
  getCurrentUser,
};
