var express = require("express");
const { createOrganization, getAllOrganizations } = require("../controllers/organization");
const verifyToken = require("../middleware/verifyToken");
var router = express.Router();

router.post("/create", verifyToken, createOrganization);
router.get("/get/all", getAllOrganizations);

module.exports = router;
