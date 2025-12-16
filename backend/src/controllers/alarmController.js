const { AppDataSource } = require("../config/dataSource");
const alarmRepo = AppDataSource.getRepository("Alarm");
const terminalRepo = AppDataSource.getRepository("Terminal");

const getAllAlarms = async (req, res) => {
    try {
        const alarms = await alarmRepo.find({
            order: {
                createdAt: "DESC"
            }
        });
        res.status(200).json(alarms);
    } catch (error) {
        console.error("Error fetching alarms:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const createAlarm = async (req, res) => {
    try {
        const { terminalID, name, status, severity } = req.body;

        // Basic validation
        if (!terminalID || !name || !status || !severity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Fetch terminal to get the name
        const terminal = await terminalRepo.findOne({ 
            where: { 
                id: terminalID,
                archived: false 
            } 
        });
        if (!terminal) {
            return res.status(404).json({ message: "Terminal not found or is archived" });
        }

        // Generate ID
        const lastAlarm = await alarmRepo.find({
            order: { id: "DESC" },
            take: 1
        });
        const nextId = (lastAlarm.length > 0 ? lastAlarm[0].id : 0) + 1;

        const newAlarm = alarmRepo.create({
            id: nextId,
            terminalID,
            terminalName: terminal.name,
            name,
            status,
            severity
        });

        await alarmRepo.save(newAlarm);
        res.status(201).json(newAlarm);
    } catch (error) {
        console.error("Error creating alarm:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllAlarms,
    createAlarm
};
