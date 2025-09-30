const express = require("express");
const router = express.Router();

const {
    createPostRescueForm,
    getPendingReports,
    getCompletedReports
} = require("../controllers/postRescueFormController");


router.post("/:alertID", createPostRescueForm);
router.get("/pending", getPendingReports);
router.get("/completed", getCompletedReports);

module.exports = router;