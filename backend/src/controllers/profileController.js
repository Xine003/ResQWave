const { AppDataSource } = require("../config/dataSource");
const adminRepo = AppDataSource.getRepository("Admin");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const { sendVerificationEmail } = require("../utils/confirmEmail");
const { setCache, getCache, deleteCache } = require("../config/cache");
const crypto = require("crypto");

const getProfile = async (req, res) => {
    try {
        const { id, role } = req.user;

        if (role === "admin") {
            const admin = await adminRepo.findOne({ where: { id } });
            if (!admin) return res.status(404).json({ message: "Admin not found" });

            return res.json({
                id: admin.id,
                name: admin.name,
                email: admin.email,
                contactNumber: admin.contactNumber,
                passwordLastUpdated: admin.passwordLastUpdated
            });
        } else if (role === "dispatcher") {
            const dispatcher = await dispatcherRepo.findOne({ where: { id } });
            if (!dispatcher) return res.status(404).json({ message: "Dispatcher not found" });

            return res.json({
                id: dispatcher.id,
                name: dispatcher.name,
                email: dispatcher.email,
                contactNumber: dispatcher.contactNumber,
                passwordLastUpdated: dispatcher.passwordLastUpdated
            });
        } else {
            return res.status(403).json({ message: "Access denied" });
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const requestEmailChange = async (req, res) => {
    try {
        const { id, role, name } = req.user;
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({ message: "New email is required" });
        }

        // Check if email is already in use
        const existingAdmin = await adminRepo.findOne({ where: { email: newEmail } });
        if (existingAdmin) return res.status(400).json({ message: "Email already in use" });

        const existingDispatcher = await dispatcherRepo.findOne({ where: { email: newEmail } });
        if (existingDispatcher) return res.status(400).json({ message: "Email already in use" });

        // Generate Code
        const code = crypto.randomInt(100000, 999999).toString();

        // Store in Cache (5 minutes)
        await setCache(`email_change:${id}`, { newEmail, code }, 300);

        // Send Email
        await sendVerificationEmail(newEmail, name, code);

        res.json({ message: "Verification code sent to new email" });
    } catch (error) {
        console.error("Error requesting email change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyEmailChange = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Verification code is required" });
        }

        // Retrieve from Cache
        const cachedData = await getCache(`email_change:${id}`);
        if (!cachedData) {
            return res.status(400).json({ message: "Code expired or invalid request" });
        }

        if (String(cachedData.code) !== String(code)) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        // Update Email in DB
        if (role === "admin") {
            await adminRepo.update(id, { email: cachedData.newEmail });
        } else if (role === "dispatcher") {
            await dispatcherRepo.update(id, { email: cachedData.newEmail });
        }

        // Clear Cache
        await deleteCache(`email_change:${id}`);

        res.json({ message: "Email updated successfully" });
    } catch (error) {
        console.error("Error verifying email change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { 
    getProfile, 
    requestEmailChange,
    verifyEmailChange
};
