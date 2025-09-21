const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { AppDataSource } = require("../config/dataSource");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const adminRepo = AppDataSource.getRepository("Admin");
const focalRepo = AppDataSource.getRepository("FocalPerson");
const loginVerificationRepo = AppDataSource.getRepository("LoginVerification");

// Registration
const register = async (req, res) => {
    try {
        const { name, password } = req.body;

        // check if already exists
        const existingAdmin = await adminRepo.findOne({ where: { name } });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exist" });
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

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const {name, password} = req.body;

        // Find Admin
        const admin = await adminRepo.findOne({ where: { name } });
        if (!admin) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Create JWT
        const token = jwt.sign(
            { id: admin.id, name: admin.name, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );


        res.json({ message: "Admin Login Successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

// Dispatcher Login
const dispatcherLogin = async (req, res) => {
    try {
        const { id, password } = req.body;
        if (!id || !password) {
            return res.status(400).json({message: "Username and password are required"});
        } 

        const dispatcher = await dispatcherRepo.findOne({ where: {id} });
        if (!dispatcher) {
            return res.status(400).json({message: "Invalid Credential"});
        }

        const isMatch = await bcrypt.compare(password, dispatcher.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid Credential"});
        }

        // Generate Code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

        // Save to Login Verification
        const verification = loginVerificationRepo.create({
            userID: dispatcher.id,
            userType: "dispatcher",
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
        });

        await transporter.sendMail({
            from: `"ResQWave" <${process.env.EMAIL_USER}>`,
            to: dispatcher.email,
            subject: "ResQWave 2FA Verification",
            text: `Your login verification is ${code}. It  will expire in 5 Minutes` 
        });

        // For dev only, log code
        console.log(`🔑 2FA code for ${dispatcher.id}: ${code}`);
      
        res.json({ message: "Verification Send to Email"});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Focal Person Login
const focalLogin = async (req, res) => {
    try {
        const { id, password } = req.body;
        if (!id || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const focal = await focalRepo.findOne({ where: { id } });
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

        res.json({ message: "Verification Send to Email"});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { 
    register, 
    adminLogin,
    dispatcherLogin,
    focalLogin,
};
