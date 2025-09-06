const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const Reservation = require("../models/Reservation")
const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- AUTH MIDDLEWARE ----------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // user.id must be available
    next();
  });
};

// ---------------- CREATE LISTING ----------------
router.post("/create", authMiddleware, upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    if (
      !category ||
      !type ||
      !streetAddress ||
      !city ||
      !province ||
      !country ||
      !title ||
      !description ||
      !highlight ||
      !highlightDesc ||
      !price ||
      !req.files.length
    ) {
      return res.status(400).json({ message: "Please fill up all information" });
    }

    const amenitiesArray = amenities ? JSON.parse(amenities) : [];
    const listingPhotoPaths = req.files.map((file) => file.path.replace(/\\/g, "/"));

    const newListing = new Listing({
      creator: req.user.id, // Use token user ID
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities: amenitiesArray,
      title,
      description,
      highlight,
      highlightDesc,
      price,
      listingPhotoPaths,
    });

    await newListing.save();

    // Make user a host automatically
    await User.findByIdAndUpdate(req.user.id, { isHost: true });

    res.status(201).json({ message: "Listing created successfully", listing: newListing });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ message: "Failed to create listing", error: err.message });
  }
});

// ---------------- GET LISTINGS BY HOST ----------------
router.get("/host/:hostId", async (req, res) => {
  try {
    const { hostId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      return res.status(400).json({ message: "Invalid host ID" });
    }

    const listings = await Listing.find({ creator: hostId }).populate("creator");
    res.status(200).json(listings);
  } catch (err) {
    console.error("Failed to fetch host listings:", err);
    res.status(500).json({ message: "Failed to fetch host listings" });
  }
});

// ---------------- SEARCH LISTINGS ----------------
router.get("/search", async (req, res) => {
  try {
    const { city, minPrice, maxPrice, category, bedroomCount, guestCount } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: new RegExp(city, "i") };
    if (category) filter.category = category;
    if (bedroomCount) filter.bedroomCount = { $gte: parseInt(bedroomCount) };
    if (guestCount) filter.guestCount = { $gte: parseInt(guestCount) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const listings = await Listing.find(filter).populate("creator");
    res.status(200).json(listings);
  } catch (err) {
    console.error("Search listings failed:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

// ---------------- GET SINGLE LISTING ----------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid listing ID" });

    const listing = await Listing.findById(id).populate("creator");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    res.status(200).json(listing);
  } catch (err) {
    console.error("Fetch listing error:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

// ---------------- GET ALL LISTINGS ----------------
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().populate("creator");
    res.status(200).json(listings);
  } catch (err) {
    console.error("Fetch listings failed:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});



// ---------------- UPDATE LISTING ----------------
router.put("/:id", authMiddleware, upload.array("listingPhotos"), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Only creator can edit
    if (listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
      removedPhotos,
    } = req.body;

    listing.category = category || listing.category;
    listing.type = type || listing.type;
    listing.streetAddress = streetAddress || listing.streetAddress;
    listing.aptSuite = aptSuite || listing.aptSuite;
    listing.city = city || listing.city;
    listing.province = province || listing.province;
    listing.country = country || listing.country;
    listing.guestCount = guestCount || listing.guestCount;
    listing.bedroomCount = bedroomCount || listing.bedroomCount;
    listing.bedCount = bedCount || listing.bedCount;
    listing.bathroomCount = bathroomCount || listing.bathroomCount;
    listing.amenities = amenities ? JSON.parse(amenities) : listing.amenities;
    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.highlight = highlight || listing.highlight;
    listing.highlightDesc = highlightDesc || listing.highlightDesc;
    listing.price = price || listing.price;

    // Remove photos if requested
    if (removedPhotos) {
      const toRemove = Array.isArray(removedPhotos) ? removedPhotos : [removedPhotos];
      listing.listingPhotoPaths = listing.listingPhotoPaths.filter((p) => !toRemove.includes(p));
    }

    // Add new uploaded photos
    if (req.files.length > 0) {
      const newImages = req.files.map((file) => file.path.replace(/\\/g, "/"));
      listing.listingPhotoPaths = [...listing.listingPhotoPaths, ...newImages];
    }

    await listing.save();
    res.status(200).json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});



// ---------------- DELETE LISTING ----------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
});




module.exports = router;
