const express = require("express");
const router = express.Router();

const {
    createPostRescueForm,
    getPendingReports,
    getCompletedReports,
    getAggregatedRescueReports,
    getAggregatedPostRescueForm,
    clearReportsCache,
    migrateOriginalAlertTypes,
    fixRescueFormStatus,
    getAlertTypeChartData,
} = require("../controllers/postRescueFormController");


router.post("/:alertID", createPostRescueForm);
router.get("/pending", getPendingReports);
router.get("/completed", getCompletedReports);
router.get("/chart/alert-types", getAlertTypeChartData);
router.get("/aggregated", getAggregatedRescueReports);
router.get("/table/aggregated", getAggregatedPostRescueForm);
router.delete("/cache", clearReportsCache);
router.post("/migrate/alert-types", migrateOriginalAlertTypes);
router.post("/fix/rescue-form-status", fixRescueFormStatus);

module.exports = router;