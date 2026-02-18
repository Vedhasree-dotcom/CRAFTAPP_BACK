const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const submissionController = require("../controllers/SubmissionController");

// USER: submit craft
router.post("/", protect, submissionController.createSubmission);

// PUBLIC: view approved submissions
router.get("/", submissionController.getApprovedSubmissions);

// ADMIN: review submissions
router.get("/pending", protect, adminOnly, submissionController.getPendingSubmissions);
router.put("/:id/approve", protect, adminOnly, submissionController.approveSubmission);
router.put("/:id/reject", protect, adminOnly, submissionController.rejectSubmission);

// USER: like or unlike submission
router.put("/:id/like", protect, submissionController.toggleLike);

module.exports = router;
