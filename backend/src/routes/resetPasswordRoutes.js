const express = require("express");
const {
    requestPasswordReset,
    verifyResetCode,
    resetPassword
} = require("../controllers/resetPasswordController");
const router = express.Router();

// Reset Password
router.post("/requestReset", requestPasswordReset);
router.post("/verifyResetCode", verifyResetCode);
router.post("/resetPassword", resetPassword);

module.exports = router;