const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "active", "expired", "rejected"],
      default: "pending",
    },
    paymentId: {
      type: String, // store Stripe/PayPal/eSewa payment ID
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
