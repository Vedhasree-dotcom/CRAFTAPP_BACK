const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware"); 

router.get("/profile", protect, getProfile);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
