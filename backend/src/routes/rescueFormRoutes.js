const express = require("express");
const router = express.Router();
const {
    createRescueForm,
    getRescueForm,
    getRescueForms,
} = require("../controllers/rescueFormController");

router.post ("/:alertID", createRescueForm);
router.get ("/:formID", getRescueForm);
router.get ("/", getRescueForms);

module.exports = router;