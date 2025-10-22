const express = require("express");
const router = express.Router();
const sensorDataController = require("../controllers/sensorDataController");

// GET latest sensor status
router.get("/sensor-data/latest", sensorDataController.getLatestStatus);

// (Optional) POST to set status for testing
router.post("/sensor-data", sensorDataController.setStatus);

module.exports = router;
