const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const upload = require("../middleware/uploadCraft")

router.get("/dashboard-stats", protect, adminOnly, adminController.getDashboardStats);

router.get("/users", protect, adminOnly, adminController.getAllUsers);

router.get("/submissions", protect, adminOnly, adminController.getAllSubmissions);
router.put("/submission/:id/status", protect, adminOnly, adminController.updateSubmissionStatus);

router.get("/craft", protect, adminOnly, adminController.getAllCrafts); 
router.post("/craft", protect, adminOnly, upload.single("image"), adminController.createCraft);
router.delete("/craft/:id", protect, adminOnly, adminController.deleteCraft);

module.exports = router;
