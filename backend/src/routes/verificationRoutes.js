const express = require("express");
const {
    sendRegistrationCode,
    verifyRegistrationCode,
    verifyDispatcherLogin,
    verifyFocalPersonLogin
} = require("../controllers/verificationController");
const router = express.Router();

router.post("/sendRegistrationCode", sendRegistrationCode);
router.post("/verifyRegistrationCode", verifyRegistrationCode);
router.post("/verifyDispatcherLogin", verifyDispatcherLogin);
router.post("/verifyFocalLogin", verifyFocalPersonLogin);

module.exports = router;

