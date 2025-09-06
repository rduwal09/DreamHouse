

const router = require("express").Router()

const Booking = require("../models/Booking")
const User = require("../models/User")
const Listing = require("../models/Listing")



// PATCH - toggle listing in wishlist
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
const user = await User.findById(userId).populate("wishList");
res.json({ wishList: user.wishList });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Add or remove listing
    const index = user.wishList.indexOf(listingId);
    if (index > -1) {
      user.wishList.splice(index, 1); // remove
    } else {
      user.wishList.push(listingId); // add
    }

    await user.save();

    // ✅ Populate after update
    const populatedUser = await User.findById(userId).populate("wishList");

    return res.status(200).json({ wishList: populatedUser.wishList });
  } catch (err) {
    console.error("Error updating wishlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// GET - fetch user's wishlist (fully populated)
router.get("/:userId/wishlist", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("wishList");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ wishList: user.wishList });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});






/* GET PROPERTY LIST */
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

// /* GET RESERVATION LIST */
// router.get("/:userId/reservations", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Fetch bookings where the logged-in user is the tenant
//     const reservations = await Booking.find({ tenant: userId })
//       .populate("tenant")     // user who booked
//       .populate("landlord")   // host
//       .populate("listing");   // property details

//     res.status(200).json(reservations);
//   } catch (err) {
//     console.log(err);
//     res.status(404).json({ message: "Cannot find reservations!", error: err.message });
//   }
// });









// GET /users/:userId/reservations
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
