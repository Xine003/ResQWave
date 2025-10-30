const express = require("express");
const {
    requestAdminDispatcherReset,
    requestFocalReset,
    verifyResetCode,
    resetPassword
} = require("../controllers/resetPasswordController");
const router = express.Router();

// Reset Password
router.post("/official/reset", requestAdminDispatcherReset);
router.post("/focal/reset", requestFocalReset);
router.post("/verifyResetCode", verifyResetCode);
router.post("/resetPassword", resetPassword);

module.exports = router;