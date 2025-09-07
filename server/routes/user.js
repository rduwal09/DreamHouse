const router = require("express").Router();
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

// routes/user.js (or wishlist route)
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // toggle wishlist
    if (user.wishlist.includes(listingId)) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== listingId);
    } else {
      user.wishlist.push(listingId);
    }

    await user.save();
    res.status(200).json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ GET - fetch user's wishlist (fully populated)
router.get("/:userId/wishlist", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("wishList");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ wishList: user.wishList });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET - user's properties
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate("creator");
    res.status(200).json(properties);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Cannot find properties!", error: err.message });
  }
});

// ✅ GET - user's reservations
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ tenant: userId, status: "paid" })
      .populate("listing")
      .populate("landlord");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});

module.exports = router;
