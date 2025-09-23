const express = require("express");
const router = express.Router();

const {
    createFocalPerson,
    getFocalPerson,
    getFocalPersons,
    updateFocalPerson,
    updateFocalPhotos,
    getFocalPhoto,
    getAlternativeFocalPhoto
} = require("../controllers/focalPersonController");

const { uploadFocalPhotos } = require("../middleware/uploadFocalPhotos");

// CRUD
router.post("/", createFocalPerson);
router.get("/", getFocalPersons);
router.get("/:id", getFocalPerson);
router.get("/:id/photo", getFocalPhoto);
router.get("/:id/altPhoto", getAlternativeFocalPhoto);
router.put("/:id", updateFocalPerson);
router.put("/:id/photos", uploadFocalPhotos, updateFocalPhotos);


module.exports = router;