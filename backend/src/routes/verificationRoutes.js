const express = require("express");
const {
    verifyDispatcherLogin,
    verifyFocalPersonLogin
} = require("../controllers/verificationController");
const router = express.Router();

router.post("/verifyDispatcherLogin", verifyDispatcherLogin);
router.post("/verifyFocalLogin", verifyFocalPersonLogin);

module.exports = router;

