const User = require("../models/User");
const Submission = require("../models/Submission");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("name email role phone savedCrafts")
      .populate({
        path: "savedCrafts",
        select: "title category price image",
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    const submissions = await Submission.find({ userId })
      .populate("craftId", "title category price image")
      .sort({ createdAt: -1 });

    const purchases = await Payment.find({
      userId,
      status: "completed",
    })
      .populate("craftId", "title category price image")
      .sort({ createdAt: -1 });

    res.json({ user, submissions, purchases });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};