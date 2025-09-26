var express = require("express");
const { sendInviteLink, acceptInvite } = require("../controllers/inviteController");
const verifyInviteToken = require("../middleware/verifyInviteToken");
const verifyToken = require("../middleware/verifyToken");
var router = express.Router();

router.post("/send", sendInviteLink);
router.post("/accept",verifyInviteToken, acceptInvite);

module.exports = router;
