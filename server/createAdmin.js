// createAdmin.js (CommonJS version)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const newAdmin = new Admin({
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by pre-save hook
    });

    await newAdmin.save();
    console.log('✅ Admin created!');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
