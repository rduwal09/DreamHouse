const router = require("express").Router();
const Booking = require("../models/Booking");

/* CREATE RENTAL REQUEST (Tenant) */
router.post("/create", async (req, res) => {
  try {
    const { tenant, landlord, listing, startDate, endDate, totalPrice } = req.body;
    if (!tenant || !landlord || !listing) {
      return res.status(400).json({ message: "Tenant, landlord, and listing are required" });
    }

    const newBooking = new Booking({
      tenant,
      landlord,
      listing,
      startDate: new Date(startDate),   // ✅ convert
      endDate: new Date(endDate),       // ✅ convert
      totalPrice,
      status: "pending",
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create booking request", error: err.message });
  }
});


/* REQUEST AGAIN (Tenant resubmits a rejected booking) */
router.put("/:id/request-again", async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, totalPrice } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "rejected") {
      return res.status(400).json({ message: "Only rejected bookings can be requested again" });
    }

    // Update booking details and reset status to pending
    if (startDate) booking.startDate = new Date(startDate);
    if (endDate) booking.endDate = new Date(endDate);

    booking.totalPrice = totalPrice || booking.totalPrice;
    booking.status = "pending";

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request again", error: err.message });
  }
});

/* UPDATE STATUS (Landlord approves/rejects/other) */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body; // "approved", "rejected", "active", "expired"

    if (!["approved", "rejected", "active", "expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to update booking status", error: err.message });
  }
});

// PUT /bookings/:id/mark-paid
router.put("/:id/mark-paid", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "paid", paymentStatus: "paid" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Error marking booking paid:", err);
    res.status(500).json({ message: "Failed to mark booking as paid" });
  }
});

/* GET BOOKINGS (by role) */
router.get("/", async (req, res) => {
  try {
    const { userId, role } = req.query; // role = tenant | landlord

    let filter = {};
    if (role === "tenant") filter.tenant = userId;
    if (role === "landlord") filter.landlord = userId;

    const bookings = await Booking.find(filter)
      .populate("tenant", "firstName lastName profileImagePath")
      .populate("landlord", "firstName lastName email")
      .populate({
        path: "listing",
        select: "_id title", // always return _id + title
      });

    // Normalize results (if listing is missing for any reason)
    const normalized = bookings.map((b) => {
      if (!b.listing) {
        return {
          ...b.toObject(),
          listing: { _id: null, title: "Unknown Listing" },
        };
      }
      return b;
    });

    res.json(normalized);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
});



module.exports = router;
