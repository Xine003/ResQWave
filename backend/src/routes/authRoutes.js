const express = require("express");
const { register, adminLogin, dispatcherLogin, focalLogin } = require("../controllers/authController");


const router = express.Router();

router.post("/register", register);
router.post("/admin/login", adminLogin);
router.post("/dispatcher/login", dispatcherLogin);
router.post("/focal/login", focalLogin);


module.exports = router;