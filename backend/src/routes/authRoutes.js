const express = require("express");
const { register, adminDispatcherLogin, adminDispatcherVerify, focalLogin, logout } = require("../controllers/authController");


const router = express.Router();

router.post("/register", register);
router.post("/login", adminDispatcherLogin);
router.post("/verify-login", adminDispatcherVerify);
router.post("/focal/login", focalLogin);
router.post("/logout", logout);


module.exports = router;