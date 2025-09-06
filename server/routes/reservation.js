const router = require("express").Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

// ---------------- GET USER RESERVATIONS ----------------
// GET /users/:userId/reservations
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ tenant: userId, status: "paid" }) // ✅ only paid
      .populate("listing")
      .populate("landlord");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});



module.exports = router;
