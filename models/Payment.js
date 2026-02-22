const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  craftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Craft",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },

  paypalOrderId: {
    type: String
  },

  paypalCaptureId: {
    type: String
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);