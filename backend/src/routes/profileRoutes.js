const express = require("express");
const router = express.Router();
const { getProfile, requestEmailChange, verifyEmailChange } = require("../controllers/profileController");

router.get("/", getProfile);
router.post("/change-email", requestEmailChange);
router.post("/verify-email-change", verifyEmailChange);

module.exports = router;
