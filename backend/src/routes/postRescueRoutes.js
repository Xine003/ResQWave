const express = require("express");
const router = express.Router();

const {
    createPostRescueForm,
    getPendingReports,
    getCompletedReports,
    getAggregatedRescueReports,
    getAggregatedPostRescueForm,
} = require("../controllers/postRescueFormController");


router.post("/:alertID", createPostRescueForm);
router.get("/pending", getPendingReports);
router.get("/completed", getCompletedReports);
router.get("/aggregated", getAggregatedRescueReports);
router.get("/table/aggregated", getAggregatedPostRescueForm);

module.exports = router;