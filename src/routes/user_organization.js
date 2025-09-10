var express = require("express");
var router = express.Router();
const {sendOtpToEmail, verifyOtp, googleAuth, getAllUser} = require("../controllers/authController");
const { getAllOrgUser } = require("../controllers/user_organization");

router.post("/send/otp", sendOtpToEmail);
router.post("/verify/otp", verifyOtp);
router.get("/google", googleAuth);
router.get("/get/all",getAllOrgUser)

module.exports = router;