const User = require("../models/User");
const Submission = require("../models/Submission");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("name email role savedCrafts")
      .populate({
        path: "savedCrafts",
        select: "title category price image",
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    const submissions = await Submission.find({ userId })
      .populate("craftId", "title category price image")
      .sort({ createdAt: -1 });

    res.json({ user, submissions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
