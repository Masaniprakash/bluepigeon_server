var express = require("express");
var router = express.Router();
const {sendOtpToEmail, verifyOtp, googleAuth, getAllUser} = require("../controllers/authController")

router.post("/send/otp", sendOtpToEmail);
router.post("/verify/otp", verifyOtp);
router.get("/google", googleAuth);
router.get("/get/all",getAllUser)

module.exports = router;