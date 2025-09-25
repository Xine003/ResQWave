const express = require("express");
const router = express.Router();
const {
    createRescueForm,
    getRescueForm
} = require("../controllers/rescueFormController");

router.post ("/:alertID", createRescueForm);
router.get ("/:formID", getRescueForm);

module.exports = router;