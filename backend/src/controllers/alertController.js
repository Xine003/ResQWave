const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const terminalRepo = AppDataSource.getRepository("Terminal");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const { getIO } = require("../realtime/socket");


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

const getAlerts = async (req, res) => {
  try {
    const alerts = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("CommunityGroup", "cg", "cg.terminalID = alert.terminalID")
      .select([
        "alert.id AS alertId",
        "alert.terminalID AS terminalId",
        "alert.alertType AS alertType",
        "alert.status AS status",
        "alert.dateTimeSent AS lastSignalTime",
        "cg.communityGroupName AS communityGroup",
        "cg.address AS address",
      ])
	  .orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "DESC")
	  .addOrderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getDispatchedAlerts = async (req, res) => {
	  try {
    const alerts = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("CommunityGroup", "cg", "cg.terminalID = alert.terminalID")
      .select([
        "alert.id AS alertId",
        "alert.terminalID AS terminalId",
        "alert.alertType AS alertType",
        "alert.status AS status",
        "alert.dateTimeSent AS lastSignalTime",
    	"cg.communityGroupName AS communityGroup", // force alias name
        "cg.address AS address",
      ])
      .where("alert.status = :status", { status: "Dispatched" })
      .orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`)
      .addOrderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// List All Alerts with waitlist status
const getWaitlistedAlerts = async (req, res) => {
  try {
    const alerts = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("CommunityGroup", "cg", "cg.terminalID = alert.terminalID")
      .select([
        "alert.id AS alertId",
        "alert.terminalID AS terminalId",
        "alert.alertType AS alertType",
        "alert.status AS status",
        "alert.dateTimeSent AS lastSignalTime",
    	"cg.communityGroupName AS communityGroup", // force alias name
        "cg.address AS address",
      ])
      .where("alert.status = :status", { status: "Waitlist" })
      .orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`)
      .addOrderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// List Alerts with Unassigned Status
const getUnassignedAlerts = async (req, res) => {
  try {
    const alerts = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("CommunityGroup", "cg", "cg.terminalID = alert.terminalID")
      .select([
        "alert.id AS alertId",
        "alert.terminalID AS terminalId",
        "alert.alertType AS alertType",
        "alert.status AS status",
        "alert.dateTimeSent AS lastSignalTime",
    	"cg.communityGroupName AS communityGroup", // force alias name
        "cg.address AS address",
      ])
      .where("alert.status = :status", { status: "Unassigned" })
      .orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`)
      .addOrderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUnassignedMapAlerts = async (req, res) => {
	try {
		const alerts = await alertRepo
			.createQueryBuilder("alert")
			.leftJoin("CommunityGroup", "cg", "cg.terminalID = alert.terminalID")
			.select([
				"cg.communityGroupName AS communityGroupName",
				"alert.alertType AS alertType",
				"alert.dateTimeSent As timeSent",
				"cg.address AS address",
				"alert.status AS status"
			])
			.where("alert.status = :status", { status: "Unassigned" })
			.orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "ASC")
			.addOrderBy("alert.dateTimeSent", "DESC")
			.getRawMany();
		
		res.json(alerts);
	} catch (err) {
		console.error(err);
		res.status(500).json({message: "Server Error"});
	}
}

const getWaitlistedMapAlerts = async (req, res) => {
	try {
		const alerts = await alertRepo
			.createQueryBuilder("alert")
			.leftJoin("CommunityGroup", "cg", "cg.terminalID = alert.terminalID")
			.select([
				"cg.communityGroupName AS communityGroupName",
				"alert.alertType AS alertType",
				"alert.dateTimeSent As timeSent",
				"cg.address AS address",
				"alert.status AS status"
			])
			.where("alert.status = :status", { status: "Waitlist" })
			.orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "DESC")
			.addOrderBy("alert.dateTimeSent", "DESC")
			.getRawMany();
		
		res.json(alerts);
	} catch (err) {
		console.error(err);
		res.status(500).json({message: "Server Error"});
	}
}

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

// UPDATE Alert Status
const updateAlertStatus = async (req, res) => {
    try {
        const { alertID } = req.params;
        const { action } = req.body; // "waitlist" or "dispatch"

        // 1. Find alert
        const alert = await alertRepo.findOne({ where: { id: alertID } });
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        // 2. Validate that rescue form exists
        const rescueForm = await rescueFormRepo.findOne({ where: { emergencyID: alertID } });
        if (!rescueForm) {
            return res.status(400).json({ message: "Rescue Form must be created before dispatching or waitlisting" });
        }

        // 3. Update status
        if (action === "waitlist") {
            alert.status = "Waitlist";
        } else if (action === "dispatch") {
            alert.status = "Dispatched";
        } else {
            return res.status(400).json({ message: "Invalid action. Use 'waitlist' or 'dispatch'." });
        }

        await alertRepo.save(alert);

		//  Realtime broadcast
		getIO().to("alerts:all").emit("alertStatusUpdated", {
		alertID: alert.id,
		newStatus: alert.status,
		});


        return res.status(200).json({
            message: `Alert ${action === "waitlist" ? "added to waitlist" : "dispatched successfully"}`,
            alert,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};





module.exports = {
	createCriticalAlert,
	createUserInitiatedAlert,
	getAlerts,
	getDispatchedAlerts,
	getWaitlistedAlerts,
	getUnassignedAlerts,
	getWaitlistedMapAlerts,
	getUnassignedMapAlerts,
	getAlert,
	updateAlertStatus 
};

