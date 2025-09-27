const { AppDataSource } = require("../config/dataSource");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();
const passwordResetRepo = AppDataSource.getRepository("ResetPassword");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

// Step 1: Request Reset 
const requestPasswordReset = async(req, res) => {
    try {
        const { userType, userID } = req.body; 
        // you can use userId or another unique identifier to look them up

        let user;
        if (userType === "dispatcher") {
            user = await dispatcherRepo.findOne({ where: { id: userID } });
        } else if (userType === "focal") {
            user = await focalPersonRepo.findOne({ where: { id: userID } });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate Reset Code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save Request
        const resetEntry = passwordResetRepo.create({
            userID: user.id,
            userType,
            code,
            expiry
        });

        await passwordResetRepo.save(resetEntry);

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        // Send Email
        await transporter.sendMail ({
            from: `"ResQWave" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "ResQWave Password Reset",
            text: `Your reset code is ${code}. It will expire in 10 Minutes.`,
        });

        // For dev: also log to server console
        // May Delete Anytime
        console.log(`🔑 Reset code for ${user.id}: ${code}`);

        res.json ({message: "Reset Code Sent To Your Phone and Email"});
    } catch (err) {
        console.error(err); 
        res.status(500).json({message: "Server Error - 500"});
    }
};

const verifyResetCode = async (req, res) => {
    const {userID, userType, code} = req.body;

    const resetEntry = await passwordResetRepo.findOne({
        where: {userID, userType, code},
    });

    if (!resetEntry) {
        return res.status(400).json({message: "Invalid Code"});
    }

    if (new Date() > resetEntry.expiry) {
        return res.status(400).json({message: "Code Expired"});
    }

    res.json({message: "Code Verified. You may reset your password"});
};

const resetPassword = async (req, res) => {
    const {userID, userType, code, newPassword} = req.body;

    const resetEntry = await passwordResetRepo.findOne({
        where: {userID, userType, code},
    });

    if (new Date() > resetEntry.expiry) {
        return res.status(400).json({message: "Code Expired"});
    }

    // Update Password in Correct Table
    let repo = userType === "dispatcher" ? dispatcherRepo : focalPersonRepo;
    const user = await repo.findOne({where: {id: userID} });

    if(!user) {
        return res.status(404).json({message: "User Not Found"});
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await repo.save(user);

    // Delete Reset Entry After Success
    await passwordResetRepo.remove(resetEntry);

    res.json({message: "Password Reset Successful"});
}

module.exports = {
    requestPasswordReset,
    verifyResetCode,
    resetPassword
}

