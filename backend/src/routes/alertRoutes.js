const express = require("express");
const router = express.Router();
const {
    createCriticalAlert,
    createUserInitiatedAlert,
    getAlerts,
    getWaitlistedAlerts,
    getDispatchedAlerts,
    getUnassignedAlerts,
    getAlert,
} = require("../controllers/alertController");

// Create alerts
router.post("/critical", createCriticalAlert);
router.post("/user", createUserInitiatedAlert);

// Read alerts
router.get("/", getAlerts);
router.get("/unassigned", getUnassignedAlerts);
router.get("/waitlist", getWaitlistedAlerts);
router.get("/dispatched", getDispatchedAlerts);
router.get("/:id", getAlert);

module.exports = router;
