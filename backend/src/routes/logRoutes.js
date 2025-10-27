const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getOwnLogs } = require("../controllers/logController");

const router = express.Router();

// Only the logged-in focal person's logs
router.get("/own", authMiddleware, getOwnLogs);

module.exports = router;