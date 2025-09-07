const Admin = require('../models/Admin');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// =================== AUTH ===================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, isAdmin: true }, // ✅ mark as admin
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      admin: { id: admin._id, email: admin.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================== DASHBOARD STATS ===================
// Dashboard stats
const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const propertyCount = await Listing.countDocuments();

    // ✅ Only count bookings where payment was successful
    const bookingCount = await Booking.countDocuments({ paymentStatus: "paid" });

    // ✅ Revenue only from successful bookings
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    const revenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      users: userCount,
      listings: propertyCount,
      bookings: bookingCount,
      revenue
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};


// =================== USERS ===================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName email createdAt isHost");

    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      fullname: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      isHost: user.isHost || false,
      createdAt: user.createdAt,
    }));

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};



const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      id: req.params.id,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// =================== PROPERTIES ===================

const getAllProperties = async (req, res) => {
  try {
    const properties = await Listing.find()
      .populate("creator", "firstName lastName email") // ✅ bring host details
      .select("title price city host createdAt"); // ✅ only needed fields

    res.status(200).json(properties);
  } catch (err) {
    console.error("Error fetching properties:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete Property
const deleteProperty = async (req, res) => {
  try {
    const property = await Listing.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({
      success: true,
      id: req.params.id,
      message: "Property deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =================== BOOKINGS ===================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "paid" }) // only paid bookings
      .populate("tenant", "firstName lastName email")
      .populate("landlord", "firstName lastName email")
      .populate("listing", "title city price");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
};





// Delete Booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({
      success: true,
      id: req.params.id,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Refund booking (change status)
const refundBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "refunded";
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to refund booking" });
  }
};

module.exports = {
  loginAdmin,
  getStats,
  getAllUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
  deleteBooking,
  refundBooking,
};
