const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User");

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // avoid overwriting files
  },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator,
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

    const listingPhotoPaths = req.files.map((file) => file.path);

    const newListing = new Listing({
      creator,
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
      listingPhotoPaths,
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
});

/* GET FILTERED LISTINGS */
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

/* GET SINGLE LISTING */
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("creator");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.status(200).json(listing);
  } catch (err) {
    console.error("Fetch listing error:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});


// GET ALL LISTINGS
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().populate("creator"); // populate host
    res.status(200).json(listings);
  } catch (err) {
    console.error("Fetch listings failed:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});


module.exports = router;
