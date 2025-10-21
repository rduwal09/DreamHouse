const router = require("express").Router();
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

// PATCH - toggle listing in wishlist
router.patch("/:userId/wishlist/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.wishList.indexOf(listingId);
    if (index === -1) {
      user.wishList.push(listingId);
    } else {
      user.wishList.splice(index, 1);
    }

    await user.save();

    // ✅ populate listings for frontend display
    const updatedUser = await User.findById(userId).populate("wishList");
    res.status(200).json({ wishList: updatedUser.wishList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// ✅ GET wishlist (populated listings)
router.get("/:userId/wishlist", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("wishList");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ wishList: user.wishList });
  } catch (err) {
    res.status(500).json({ message: err.message });
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