const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  craftId: { type: mongoose.Schema.Types.ObjectId, ref: "Craft" },
  images: [String],
  description: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Submission", SubmissionSchema);