const express = require("express");
const Stripe = require("stripe");
const Booking = require("../models/Booking");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ----------------------
// Create Checkout Session
// ----------------------
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({ error: "Amount and bookingId required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Rental Payment" },
            unit_amount: amount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/success?bookingId=${bookingId}`,
      cancel_url: `http://localhost:3000/failure?bookingId=${bookingId}`,
      metadata: { bookingId }, // attach bookingId
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe Checkout Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Stripe Webhook
// ----------------------
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw body only here
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      try {
        // mark as paid instead of "booked"
        await Booking.findByIdAndUpdate(bookingId, {
          status: "paid",
          paymentId: session.payment_intent,
          paymentStatus: "paid",
        });

        console.log(`✅ Booking ${bookingId} marked as paid`);
      } catch (err) {
        console.error("Failed to update booking:", err.message);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
