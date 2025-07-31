const Admin = require('../models/Admin');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// Admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Dashboard stats
const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const propertyCount = await Listing.countDocuments();
    const appointmentCount = await Booking.countDocuments();

    res.status(200).json({
      users: userCount,
      properties: propertyCount,
      appointments: appointmentCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
//all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('firstname lastname email');

    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      fullname: `${user.firstname} ${user.lastname}`.trim()
    }));

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginAdmin,
  getStats,
  getAllUsers
};
