const express = require("express");
const router = express.Router();
const axios = require("axios");
const Payment = require("../models/Payment");
const Craft = require("../models/Craft");
const { protect } = require("../middleware/authMiddleware");

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  
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
    const { craftId } = req.body;

    if (!craftId) {
      return res.status(400).json({ error: "Craft ID required" });
    }

    const craft = await Craft.findById(craftId);

    if (!craft) {
      return res.status(404).json({ error: "Craft not found" });
    }

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            description: craft.title, 
            amount: {
              currency_code: "USD",
              value: craft.price.toString(),
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
    console.error("Create order error:", err.response?.data || err.message);
    res.status(500).json({ error: "PayPal create order failed" });
  }
});


router.post("/capture-order", protect, async (req, res) => {
  const { orderId, craftId } = req.body;

  try {
    const craft = await Craft.findById(craftId);
    if (!craft) {
      return res.status(404).json({ error: "Craft not found" });
    }

    const alreadyPurchased = await Payment.findOne({
      userId: req.user._id,
      craftId,
    });

    if (alreadyPurchased) {
      return res.status(400).json({ error: "Craft already purchased" });
    }

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


router.get("/check-purchase/:craftId", protect, async (req, res) => {
  const payment = await Payment.findOne({
    userId: req.user._id,
    craftId: req.params.craftId,
    status: "completed",
  });

  res.json({ purchased: !!payment });
});

module.exports = router;