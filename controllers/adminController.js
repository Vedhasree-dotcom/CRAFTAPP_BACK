const User = require("../models/User");
const Submission = require("../models/Submission");
const Craft = require("../models/Craft");
const Payment = require("../models/Payment");

exports.getDashboardStats = async (req, res) => {
  const users = await User.countDocuments();
  const crafts = await Craft.countDocuments();
  const submissions = await Submission.countDocuments({ status: "pending" });

  res.json({ users, crafts, pendingSubmissions: submissions });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.getAllSubmissions = async (req, res) => {
  const submissions = await Submission.find()
    .populate("userId", "name email")
    .populate("craftId", "title");
  res.json(submissions);
};

exports.updateSubmissionStatus = async (req, res) => {
  const { status } = req.body;
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(submission);
};

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Payment.find({ status: "completed" })
      .populate("userId", "name email")
      .populate("craftId", "title price")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
};
