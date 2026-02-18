const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware"); 

router.get("/profile", protect, getProfile);

module.exports = router;
