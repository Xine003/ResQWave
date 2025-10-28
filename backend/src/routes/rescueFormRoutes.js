const express = require("express");
const router = express.Router();
const {
    createRescueForm,
    getRescueForm,
    getRescueForms,
    updateRescueFormStatus,
} = require("../controllers/rescueFormController");

router.post ("/:alertID", createRescueForm);
router.patch("/:alertID/status", updateRescueFormStatus); // Update status
router.get ("/:formID", getRescueForm);
router.get ("/", getRescueForms);

module.exports = router;