const express = require("express");
const router = express.Router();
const {
    createFocalPerson,
    getFocalPerson,
    getFocalPersons,
    updateFocalPerson
} = require("../controllers/focalPersonController");

// CRUD
router.post("/", createFocalPerson);
router.get("/", getFocalPersons);
router.get("/:id", getFocalPerson);
router.put("/:id", updateFocalPerson);

module.exports = router;