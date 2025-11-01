const express = require("express");
const router = express.Router();
const {
    createRescueForm,
    getRescueForm,
    getRescueForms,
    updateRescueFormStatus,
    getAggregatedRescueForm,
} = require("../controllers/rescueFormController");

router.post ("/:alertID", createRescueForm);
router.patch("/:alertID/status", updateRescueFormStatus); // Update status
router.get("/table/aggregated", getAggregatedRescueForm);
router.get ("/", getRescueForms);
router.get ("/:formID", getRescueForm);

module.exports = router;