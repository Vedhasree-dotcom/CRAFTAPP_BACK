const express = require("express");
const router = express.Router();
const axios = require("axios");
const Payment = require("../models/Payment");
const { protect } = require("../middleware/authMiddleware");

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  // console.log("ID:", process.env.PAYPAL_CLIENT_ID?.slice(0,10));
  // console.log("Secret:", process.env.PAYPAL_SECRET?.slice(0,10));
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (err) {
    console.error("PayPal token error:", err.response?.data || err.message);
    throw new Error("Failed to get PayPal access token");
  }
}

router.post("/create-order", protect, async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "5.00", 
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ orderId: response.data.id });
  } catch (err) {
    console.error("Create order FULL:", JSON.stringify(err.response?.data, null, 2));
  res.status(500).json({ error: "PayPal create order failed" });
  }
});

router.post("/capture-order", protect, async (req, res) => {
  const { orderId, craftId } = req.body;

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const amount =
      response.data.purchase_units[0].payments.captures[0].amount.value;

    // Save payment in DB
    await Payment.create({
      userId: req.user._id,
      craftId,
      amount,
      status: "completed",
      paypalOrderId: orderId,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("PayPal capture order error:", err.response?.data || err.message);
    res.status(500).json({ error: "PayPal capture order failed" });
  }
});

module.exports = router;