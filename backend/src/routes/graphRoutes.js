const express = require("express");
const router = express.Router();
const { getAlertStats } = require("../controllers/graphController");

router.get("/graph", getAlertStats);

module.exports = router;