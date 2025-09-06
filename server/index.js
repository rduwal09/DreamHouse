const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require("cors");

dotenv.config();

const app = express();

// ✅ CORS must come BEFORE any routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend's origin
  credentials: true                // If you're using cookies/auth
}));

app.use(express.json());
app.use(express.static("public"));

// Routes
const adminRoutes = require('./routes/admin');
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const reviewRoutes = require("./routes/reviews");
const reservationRoutes = require("./routes/reservation.js");
const paymentRoutes = require("./routes/payment.js")

app.use('/api/admin', adminRoutes);
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reservations", reservationRoutes);
app.use("/", paymentRoutes);

/* MONGOOSE SETUP */
const PORT = 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Homeland",
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
