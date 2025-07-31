const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User")

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
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
router.get("/", async (req, res) => {
  try {
    const { city, bedroomCount, guestCount, category } = req.query;

    const filter = {};

    if (city) filter.city = { $regex: new RegExp(city, "i") };
    if (category) filter.category = category;
    if (bedroomCount) filter.bedroomCount = { $gte: parseInt(bedroomCount) };
    if (guestCount) filter.guestCount = { $gte: parseInt(guestCount) };

    const listings = await Listing.find(filter);
    res.status(200).json(listings);
  } catch (err) {
    console.error("Failed to fetch listings:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

module.exports = router;
