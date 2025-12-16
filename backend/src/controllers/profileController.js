const { AppDataSource } = require("../config/dataSource");
const adminRepo = AppDataSource.getRepository("Admin");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");

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

module.exports = { getProfile };
