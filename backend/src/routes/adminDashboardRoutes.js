const express = require("express");
const router = express.Router();
const { getAdminDashboardStats } = require("../controllers/adminDashboard");

router.get("/stats", getAdminDashboardStats);

module.exports = router;
