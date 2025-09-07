const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
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


// Properties
router.get('/properties', adminAuth, getAllProperties);
router.delete('/properties/:id', adminAuth, deleteProperty);

// Bookings
router.get('/bookings', adminAuth, getAllBookings);
router.delete('/bookings/:id', adminAuth, deleteBooking);
router.patch('/bookings/:id/refund', adminAuth, refundBooking);


module.exports = router;
