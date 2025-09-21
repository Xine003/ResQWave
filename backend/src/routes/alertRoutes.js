const express = require("express");
const router = express.Router();
const {
    createCriticalAlert,
    createUserInitiatedAlert,
    getAlerts,
    getAlert,
} = require("../controllers/alertController");

// Create alerts
router.post("/critical", createCriticalAlert);
router.post("/user", createUserInitiatedAlert);

// Read alerts
router.get("/", getAlerts);
router.get("/:id", getAlert);

module.exports = router;
