const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadCraft");   
const { protect, adminOnly } = require("../middleware/authMiddleware");
const submissionController = require("../controllers/SubmissionController");


router.post("/", protect,   upload.single("images"),  
 submissionController.createSubmission);

// PUBLIC: view approved submissions
router.get("/", submissionController.getApprovedSubmissions);

// ADMIN: review submissions
router.get("/pending", protect, adminOnly, submissionController.getPendingSubmissions);
router.put("/:id/approve", protect, adminOnly, submissionController.approveSubmission);
router.put("/:id/reject", protect, adminOnly, submissionController.rejectSubmission);

// USER: like or unlike submission
router.put("/:id/like", protect, submissionController.toggleLike);

module.exports = router;
