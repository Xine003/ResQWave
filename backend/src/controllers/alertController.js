const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const terminalRepo = AppDataSource.getRepository("Terminal");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const { getIO } = require("../realtime/socket");
const {
	getCache,
	setCache,
} = require("../config/cache");


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

// Get All Alerts
// Table View
const getAlerts = async (req, res) => {
  try {
	const cacheKey = "alerts:all";
	const cached = await getCache(cacheKey);
	if (cached) return res.json(cached);

    const alerts = await alertRepo
      .createQueryBuilder("alert")
	  .leftJoin("Terminal", "t", "t.id = alert.terminalID")
	  .leftJoin("Neighborhood", "n", "n.terminalID = alert.terminalID")
	  .leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
      .select([
        "alert.id AS alertId",
        "alert.terminalID AS terminalId",
        "alert.alertType AS alertType",
        "alert.status AS status",
        "alert.dateTimeSent AS lastSignalTime",
        "t.name AS terminalName",
        "fp.address AS address",
      ])
	  .orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "DESC")
	  .addOrderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

	await setCache(cacheKey, alerts, 10);
    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// List all alerts with Dispatched Alerts
// Table View
const getDispatchedAlerts = async (req, res) => {
	  try {
		const cacheKey = "alerts:dispatched";
		const cached = await getCache(cacheKey);
		if (cached) return res.json(cached);

	const alerts = await alertRepo
		.createQueryBuilder("alert")
		.leftJoin("Terminal", "t", "t.id = alert.terminalID")
		.leftJoin("Neighborhood", "n", "n.terminalID = alert.terminalID")
		.leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
		.select([
			"alert.id AS alertId",
			"alert.terminalID AS terminalId",
			"alert.alertType AS alertType",
			"alert.status AS status",
			"alert.dateTimeSent AS lastSignalTime",
			"t.name AS terminalName",
			"fp.address AS address",
		])
		.where("alert.status = :status", { status: "Dispatched" })
		.orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "DESC")
		.addOrderBy("alert.dateTimeSent", "DESC")
		.getRawMany();

	await setCache(cacheKey, alerts, 10);
    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// List All Alerts with waitlist status
// Table View
const getWaitlistedAlerts = async (req, res) => {
  try {
	const cacheKey = "alerts:waitlist";
	const cached = await getCache(cacheKey);
	if (cached) return res.json(cached);

	const alerts = await alertRepo
		.createQueryBuilder("alert")
		.leftJoin("Terminal", "t", "t.id = alert.terminalID")
		.leftJoin("Neighborhood", "n", "n.terminalID = alert.terminalID")
		.leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
		.select([
			"alert.id AS alertId",
			"alert.terminalID AS terminalId",
			"alert.alertType AS alertType",
			"alert.status AS status",
			"alert.dateTimeSent AS lastSignalTime",
			"t.name AS terminalName",
			"fp.address AS address",
		])
		.where("alert.status = :status", { status: "Waitlist" })
		.orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "DESC")
		.addOrderBy("alert.dateTimeSent", "DESC")
		.getRawMany();

	await setCache(cacheKey, alerts, 10);
    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// List Alerts with Unassigned Status
// Table View
const getUnassignedAlerts = async (req, res) => {
  try {
	const cacheKey = "alerts:unassigned";
	const cached = await getCache(cacheKey);
	if (cached) return res.json(cached);

	const alerts = await alertRepo
		.createQueryBuilder("alert")
		.leftJoin("Terminal", "t", "t.id = alert.terminalID")
		.leftJoin("Neighborhood", "n", "n.terminalID = alert.terminalID")
		.leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
		.select([
			"alert.id AS alertId",
			"alert.terminalID AS terminalId",
			"alert.alertType AS alertType",
			"alert.status AS status",
			"alert.dateTimeSent AS lastSignalTime",
			"t.name AS terminalName",
			"fp.address AS address",
		])
		.where("alert.status = :status", { status: "Unassigned" })
		.orderBy(`CASE WHEN alert.alertType = 'Critical' THEN 0 ELSE 1 END`, "DESC")
		.addOrderBy("alert.dateTimeSent", "DESC")
		.getRawMany();

	await setCache(cacheKey, alerts, 10);
    res.json(alerts);
  } catch (err) {
    console.error("[getAlerts] error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Unassigned Map Alerts
// Map View - Display ALL occupied terminals (terminals with neighborhood/focal person)
const getUnassignedMapAlerts = async (req, res) => {
  try {
    const cacheKey = "mapAlerts:allOccupied";
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log('[BACKEND] Returning cached occupied terminals:', cached.length);
      return res.json(cached);
    }

    console.log('[BACKEND] Fetching all occupied terminals from database...');

    // Fetch all terminals that have a neighborhood/focal person (occupied terminals)
    // Join with the latest alert for each terminal to get alert data
    const latestAlertSQ = alertRepo
      .createQueryBuilder("a")
      .select("a.terminalID", "terminalID")
      .addSelect("MAX(a.dateTimeSent)", "lastTime")
      .groupBy("a.terminalID");

    const terminals = await terminalRepo
      .createQueryBuilder("t")
      .leftJoin("Neighborhood", "n", "n.terminalID = t.id")
      .leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
      .leftJoin(
        "(" + latestAlertSQ.getQuery() + ")",
        "latestAlert",
        "latestAlert.terminalID = t.id"
      )
      .leftJoin("Alert", "alert", "alert.terminalID = t.id AND alert.dateTimeSent = latestAlert.lastTime")
      .setParameters(latestAlertSQ.getParameters())
      .select([
        // Terminal data
        "t.id AS terminalId",
        "t.name AS terminalName",
        "t.status AS terminalStatus",
        // Alert data (from latest alert, or null if no alerts exist)
        "alert.id AS alertId",
        "alert.alertType AS alertType", // Can be NULL, 'Critical', or 'User-Initiated'
        "COALESCE(alert.dateTimeSent, t.dateCreated) AS timeSent",
        "alert.status AS alertStatus",
        // Focal Person data
        "fp.id AS focalPersonId",
        "fp.firstName AS focalFirstName",
        "fp.lastName AS focalLastName",
        "fp.address AS focalAddress",
        "fp.contactNumber AS focalContactNumber",
      ])
      .where("n.focalPersonID IS NOT NULL") // Only occupied terminals
      .getRawMany();

    console.log('[BACKEND] Found occupied terminals:', terminals.length);
    if (terminals.length > 0) {
      console.log('[BACKEND] First terminal sample:', {
        terminalId: terminals[0].terminalId,
        terminalName: terminals[0].terminalName,
        terminalStatus: terminals[0].terminalStatus,
        focalAddress: terminals[0].focalAddress
      });
    }

    await setCache(cacheKey, terminals, 10);
    res.json(terminals);
  } catch (err) {
    console.error('[BACKEND] Error in getUnassignedMapAlerts:', err);
    res.status(500).json({message: "Server Error"});
  }
};

// Get Waitlist Map Alerts
// Map View - Returns empty array since we're showing all terminals in unassigned endpoint
const getWaitlistedMapAlerts = async (req, res) => {
  try {
    // Return empty array since we're now showing all occupied terminals in the unassigned endpoint
    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Server Error"});
  }
};


// Read Single Alert
// Table View More Info
const getAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `alert:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const row = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("Terminal", "t", "t.id = alert.terminalID")
      .leftJoin("Neighborhood", "n", "n.terminalID = alert.terminalID")
      .leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
      .select([
        "alert.id AS alertID",
        "alert.terminalID AS terminalID",
        "t.name AS terminalName",
        "alert.alertType AS alertType",
        "alert.status AS status",
        "alert.dateTimeSent AS timeSent",
        "fp.address AS address",
      ])
      .where("alert.id = :id", { id })
      .getRawOne();

    if (!row) return res.status(404).json({ message: "Alert Not Found" });

    await setCache(cacheKey, row, 10);
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - READ Alert" });
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

