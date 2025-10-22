const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
    createFocalPerson,
    approveFocalRegistration,
    getFocalPerson,
    getFocalPersons,
    updateFocalPerson,
    updateFocalPhotos,
    getFocalPhoto,
    getAlternativeFocalPhoto,
    changePassword,
} = require("../controllers/focalPersonController");

const { uploadFocalPhotos } = require("../middleware/uploadFocalPhotos");


// CRUD
router.post("/", uploadFocalPhotos, createFocalPerson);
router.post("/:id/approve", approveFocalRegistration);
router.get("/", getFocalPersons);
router.get("/:id", getFocalPerson);
router.get("/:id/photo", getFocalPhoto);
router.get("/:id/altPhoto", getAlternativeFocalPhoto);
router.put("/:id", updateFocalPerson);
router.put("/me/changePassword", changePassword);
router.put("/:id/changePassword", changePassword);
router.put("/:id/photos", uploadFocalPhotos, updateFocalPhotos);


module.exports = router;