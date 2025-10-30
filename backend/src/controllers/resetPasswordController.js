const { AppDataSource } = require("../config/dataSource");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const passwordResetRepo = AppDataSource.getRepository("ResetPassword");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");
const adminRepo = AppDataSource.getRepository("Admin")

// Step 1: Request Reset 
const requestAdminDispatcherReset = async (req, res) => {
    try {
        const {emailOrNumber} = req.body;
        const identifier = String(emailOrNumber || "").trim();

        if (!identifier) {
            return res.status(400).json({message: "Email or Contact Number is Required"});
        }

        // Try to find Admin First
        let user = await adminRepo.findOne({where: {email: identifier} });
        let userType = "admin";

        // If not admin, check Dispatcher
        if (!user) {
            user = await dispatcherRepo.findOne({ where: [{email: identifier}, {contactNumber: identifier}]});
            userType = "dispatcher";
        }

        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        // Generate Reset Code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

        const resetEntry = passwordResetRepo.create({
            userID: user.id,
            userType,
            code,
            expiry,
        });
        await passwordResetRepo.save(resetEntry);

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false},
        });

        await transporter.sendMail({
            from: `"ResQWave" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "ResQWave Password Reset",
            text: `Your password reset code is ${code}. It will expire in 10 Minutes`,
        });

        console.log(`Reset Code for ${userType} (${user.id}): ${code}`);
        res.json({message: "Reset Code sent to your registered email"});
    } catch (err) {
        console.error(err) 
            res.status(500).json({message: "Server Error"});
    }
};

const requestFocalReset = async(req, res) => {
    try {
        const { emailOrNumber } = req.body;
        const identifier = String(emailOrNumber || "").trim();

        if (!identifier) {
            return res.status(400).json({ message: "Email or contact number is required" });
        }

        const focal = await focalPersonRepo.findOne({ where: [{email: identifier}, {contactNumber: identifier}]});

        if (!focal) {
            return res.status(404).json({ message: "User not found" });
        }

        const code = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        const resetEntry = passwordResetRepo.create({
            userID: focal.id,
            userType: "focal",
            code,
            expiry,
        });
        await passwordResetRepo.save(resetEntry);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
            from: `"ResQWave" <${process.env.EMAIL_USER}>`,
            to: focal.email,
            subject: "ResQWave Password Reset",
            text: `Your password reset code is ${code}. It will expire in 10 minutes.`,
        });

        console.log(`🔑 Reset code for focal (${focal.id}): ${code}`);
        res.json({message: "Reset Code sent to your registered email."});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

const verifyResetCode = async(req, res) => {
    try {
        const {userID, code} = req.body;
        
        const resetEntry = await passwordResetRepo.findOne({where: {userID, code} });

        if (!resetEntry) {
            return res.status(400).json({message: "Invalid Code"});
        }

        if (new Date() > resetEntry.expiry) {
            return res.status(400).json({message: "Code Expired"});
        }

        res.json({message: "Code Verified. You may reset your password."});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

const resetPassword = async (req, res) => {
  try {
    const { userID, code, newPassword } = req.body;

    const resetEntry = await passwordResetRepo.findOne({
      where: { userID, code },
    });

    if (!resetEntry) {
      return res.status(400).json({ message: "Invalid Code" });
    }

    if (new Date() > resetEntry.expiry) {
      return res.status(400).json({ message: "Code Expired" });
    }

    // Normalize userType to lowercase for consistency
    const userType = resetEntry.userType.toLowerCase();

    let repo;
    switch (userType) {
      case "focal" || "Focal":
        repo = focalPersonRepo;
        break;
      case "dispatcher" || "Dispatcher":
        repo = dispatcherRepo;
        break;
      case "admin" || "Admin":
        repo = adminRepo;
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    const user = await repo.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await repo.save(user);

    await passwordResetRepo.remove(resetEntry);

    res.json({ message: "Password Reset Successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
    requestAdminDispatcherReset,
    requestFocalReset,
    verifyResetCode,
    resetPassword
}

