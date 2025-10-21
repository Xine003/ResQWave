const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({storage: multer.memoryStorage()});

const {
    submitFocalRegistration
} = require("../controllers/focalRegistrationController")

router.post("/registration",
    upload.fields([{name: "photo", maxCount: 1}, {name: "altPhoto", maxCount: 1}]),    
    submitFocalRegistration
);

module.exports = router;