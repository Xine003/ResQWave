const express = require("express");
const {
    sendRegistrationCode,
    verifyRegistrationCode,
    verifyFocalPersonLogin,
    adminDispatcherVerify
} = require("../controllers/verificationController");
const router = express.Router();

router.post("/verify", adminDispatcherVerify);
router.post("/sendRegistrationCode", sendRegistrationCode);
router.post("/verifyRegistrationCode", verifyRegistrationCode);
router.post("/verifyFocalLogin", verifyFocalPersonLogin);

module.exports = router;

