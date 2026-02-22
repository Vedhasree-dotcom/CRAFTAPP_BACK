const express = require("express");
const router = express.Router();
const axios = require("axios");
const Payment = require("../models/Payment");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, async (req, res) => {

  const response = await axios.post(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "5.00"
          }
        }
      ]
    },
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET
      }
    }
  );

  res.json({ orderId: response.data.id });
});

router.post("/capture-order", protect, async (req, res) => {

  const { orderId, craftId } = req.body;

  const response = await axios.post(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET
      }
    }
  );

  await Payment.create({
    userId: req.user._id,
    craftId,
    amount: response.data.purchase_units[0].payments.captures[0].amount.value,
    status: "completed",
    paypalOrderId: orderId
  });

  res.json({ success: true });
});

module.exports = router;