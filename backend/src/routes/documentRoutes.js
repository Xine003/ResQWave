const express = require("express");
const router = express.Router();
const { generateRescueReport } = require("../controllers/documentController");

router.get("/rescueReports/:alertID", generateRescueReport);

module.exports = router;