const { AppDataSource } = require("../config/dataSource");
// removed unused SensorData variable

// Get the latest sensor status (assume only one row, or get the latest by ID)
exports.getLatestStatus = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository("SensorData");
        // Get the latest by ID desc (TypeORM v0.3.x requires find+take)
        const latestArr = await repo.find({ order: { ID: "DESC" }, take: 1 });
        const latest = latestArr[0];
        if (!latest) return res.status(404).json({ status: false, message: "No sensor data found" });
        res.json({ status: latest.status });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

// (Optional) Add endpoint to update status for testing
exports.setStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const repo = AppDataSource.getRepository("SensorData");
        const newRow = repo.create({ status });
        await repo.save(newRow);
        res.json({ success: true, data: newRow });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
