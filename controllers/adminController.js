const User = require("../models/User");
const Submission = require("../models/Submission");
const Craft = require("../models/Craft");

exports.getDashboardStats = async (req, res) => {
  const users = await User.countDocuments();
  const crafts = await Craft.countDocuments();
  const submissions = await Submission.countDocuments({ status: "pending" });

  res.json({ users, crafts, pendingSubmissions: submissions });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
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

exports.createCraft = async (req, res) => {
  const craft = await Craft.create(req.body);
  res.status(201).json(craft);
};

exports.getAllCrafts = async (req, res) => {
  try {
    const crafts = await Craft.find().sort({ createdAt: -1 });
    res.json(crafts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCraft = async (req, res) => {
  await Craft.findByIdAndDelete(req.params.id);
  res.json({ message: "Craft deleted" });
};
