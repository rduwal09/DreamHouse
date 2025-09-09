const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Booking = require("../models/Booking");
const User = require("../models/User");

// const stripe = require("stripe")(process.env.STRIPE_SECRET);


const {
  loginAdmin,
  getStats,
  getAllUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
  deleteBooking,
  refundBooking,
} = require('../controllers/admincontroller');

// Auth
router.post('/login', loginAdmin);

// Dashboard
router.get('/stats', adminAuth, getStats);

// Users
router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

// Toggle Host Role
router.patch('/users/:id/toggle-host', adminAuth, async (req, res) => {
  const User = require('../models/User');

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Flip isHost
    user.isHost = !user.isHost;
    await user.save();

    // Role string for frontend
    const role = user.isHost ? "Host & Tenant" : "Tenant";

    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullname: `${user.firstname} ${user.lastname}`.trim(),
      isHost: user.isHost,
      role,
    });
  } catch (err) {
    console.error("Error toggling host role:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.patch("/bookings/:bookingId/refund", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "refunded" },
      { new: true }
    )
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("listing", "title city price");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking refunded successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error processing refund", error });
  }
});

// Property requests (just display bookings)
router.get("/property-requests", async (req, res) => {
  try {
    const requests = await Booking.find()
      .populate("tenant", "firstname lastname email")
      .populate("landlord", "firstname lastname email")
      .populate("listing", "title city");

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching property requests:", err);
    res.status(500).json({ error: "Failed to fetch property requests" });
  }
});




// Properties
router.get('/properties', adminAuth, getAllProperties);
router.delete('/properties/:id', adminAuth, deleteProperty);

// Bookings
router.get('/bookings', adminAuth, getAllBookings);
router.delete('/bookings/:id', adminAuth, deleteBooking);
router.patch('/bookings/:id/refund', adminAuth, refundBooking);

// 📊 Users Growth per Week
router.get("/analytics/users-growth", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const formatted = users.map(u => ({
      week: `W${u._id.week} ${u._id.year}`, // Example: "W36 2025"
      users: u.count
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users growth weekly", error: err.message });
  }
});


// 📊 Bookings per Week
router.get("/analytics/bookings", async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const formatted = bookings.map(b => ({
      week: `W${b._id.week} ${b._id.year}`,
      bookings: b.count
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings weekly", error: err.message });
  }
});


// 📊 Revenue per Week
router.get("/analytics/revenue", async (req, res) => {
  try {
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } }, 
      {
        
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          total: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const formatted = revenue.map(r => ({
      week: `W${r._id.week} ${r._id.year}`,
      revenue: r.total
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch revenue weekly", error: err.message });
  }
});


module.exports = router;
