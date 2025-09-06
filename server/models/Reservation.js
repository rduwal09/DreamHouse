const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    startDate: Date,
    endDate: Date,
    totalPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
