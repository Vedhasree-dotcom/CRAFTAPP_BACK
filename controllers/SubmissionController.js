const Submission = require("../models/Submission");

// Create Submission
exports.createSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const submission = await Submission.create({
      userId: req.user._id,
      craftId: req.body.craftId,
      description: req.body.description,
      images: ["/uploads/" + req.file.filename],  
      status: "pending"
    });

    res.status(201).json(submission);

  } catch (err) {
    console.error("CREATE SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Approved Submissions
exports.getApprovedSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: "approved" })
      .populate("userId", "name")
      .populate("craftId", "title")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Get Pending Submissions
exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: "pending" });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Approve Submission
exports.approveSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.json({ message: "Approved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reject Submission
exports.rejectSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle Like
exports.toggleLike = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const userId = req.user._id;

    const alreadyLiked = submission.likes.includes(userId);

    if (alreadyLiked) {
      submission.likes = submission.likes.filter(
        id => id.toString() !== userId.toString()
      );
    } else {
      submission.likes.push(userId);
    }

    await submission.save();

    res.json({ message: "Like updated", likes: submission.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
