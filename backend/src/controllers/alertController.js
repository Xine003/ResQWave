const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const terminalRepo = AppDataSource.getRepository("Terminal");

// Helper: generate incremental Alert ID like ALRT001
async function generateAlertId() {
	const last = await alertRepo
		.createQueryBuilder("alert")
		.orderBy("alert.id", "DESC")
		.getOne();
	let newNumber = 1;
	if (last) {
		const match = String(last.id).match(/(\d+)$/);
		if (match) newNumber = parseInt(match[1], 10) + 1;
	}
	return "ALRT" + String(newNumber).padStart(3, "0");
}

// Create Critical Alert (sensor-triggered)
const createCriticalAlert = async (req, res) => {
	try {
		const { terminalID, alertType, sentThrough } = req.body;
		if (!terminalID) return res.status(400).json({ message: "terminalID is required" });

		const terminal = await terminalRepo.findOne({ where: { id: terminalID } });
		if (!terminal) return res.status(404).json({ message: "Terminal Not Found" });

		const id = await generateAlertId();
		const alert = alertRepo.create({
			id,
			terminalID,
			alertType: alertType || "Critical",
			sentThrough: sentThrough || "Sensor",
			status: "Critical",
			terminal: { id: terminalID },
		});

		await alertRepo.save(alert);
		res.status(201).json({ message: "Critical alert created", alert });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error - CREATE Critical Alert" });
	}
};

// Create User-Initiated Alert (button press)
const createUserInitiatedAlert = async (req, res) => {
	try {
		const { terminalID, alertType, sentThrough } = req.body;
		if (!terminalID) return res.status(400).json({ message: "terminalID is required" });

		const terminal = await terminalRepo.findOne({ where: { id: terminalID } });
		if (!terminal) return res.status(404).json({ message: "Terminal Not Found" });

		const id = await generateAlertId();
		const alert = alertRepo.create({
			id,
			terminalID,
			alertType: alertType || "User",
			sentThrough: sentThrough || "Button",
			status: "User-Initiated",
			terminal: { id: terminalID },
		});

		await alertRepo.save(alert);
		res.status(201).json({ message: "User-initiated alert created", alert });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error - CREATE User-Initiated Alert" });
	}
};

// List Alerts with optional filters: status, terminalId
const getAlerts = async (req, res) => {
	try {
		const { status, terminalId } = req.query;
		const where = {};
		if (status && ["Critical", "User-Initiated"].includes(status)) where.status = status;
		if (terminalId) where.terminalID = terminalId;
		const alerts = await alertRepo.find({ where, order: { dateTimeSent: "DESC" } });
		res.json(alerts);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error - READ Alerts" });
	}
};

// Read Single Alert
const getAlert = async (req, res) => {
	try {
		const { id } = req.params;
		const alert = await alertRepo.findOne({ where: { id } });
		if (!alert) return res.status(404).json({ message: "Alert Not Found" });
		res.json(alert);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error - READ Alert" });
	}
};

module.exports = {
	createCriticalAlert,
	createUserInitiatedAlert,
	getAlerts,
	getAlert,
};

