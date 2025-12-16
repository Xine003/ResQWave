const express = require("express");
const router = express.Router();
const { getAllAlarms, createAlarm } = require("../controllers/alarmController");

router.get("/", getAllAlarms);
router.post("/", createAlarm);

module.exports = router;
