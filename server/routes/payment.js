// server/routes/payment.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Warn if required envs are missing (helps debugging)
["STRIPE_SECRET_KEY", "CLIENT_URL"].forEach((k) => {
  if (!process.env[k]) console.warn(`[payment] Missing env: ${k}`);
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a checkout session (no webhook needed)
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items = [], bookingId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    const line_items = items.map((item, idx) => {
      const price = Number(item.price);
      if (!price || price <= 0) {
        throw new Error(`Invalid price for items[${idx}]`);
      }
      return {
        price_data: {
          currency: "usd",
          product_data: { name: item.name || "Booking" },
          unit_amount: Math.round(price * 100), // cents
        },
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      };
    });

    const clientBase = process.env.CLIENT_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${clientBase}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBase}/failure`,   // 👈 updated to failure page
      metadata: { bookingId: bookingId || "" },
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    return res.status(500).json({ error: err.message || "Failed to create checkout session" });
  }
});

// Retrieve a checkout session (for /success page)
router.get("/checkout-session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["payment_intent"], // richer details on success page
    });
    return res.json(session);
  } catch (err) {
    console.error("❌ Retrieve session error:", err);
    return res.status(400).json({ error: err.message || "Failed to fetch session" });
  }
});

module.exports = router;
