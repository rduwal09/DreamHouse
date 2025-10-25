const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

// Normalize numeric values to 0-1 range
function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

// Encode categorical features as numbers
function encodeCategory(value, categories) {
  return categories.indexOf(value) !== -1 ? 1 : 0;
}

// Build combined feature vector from a listing
async function buildVector(listing, allListings) {
  const prices = allListings.map(l => l.price || 0);
  const areas = allListings.map(l => l.area || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minArea = Math.min(...areas);
  const maxArea = Math.max(...areas);

  // Unique categories for encoding
  const types = [...new Set(allListings.map(l => l.type))];
  const cities = [...new Set(allListings.map(l => l.city))];
  const countries = [...new Set(allListings.map(l => l.country))];

  // Numeric features normalized
  const numericVector = [
    normalize(listing.price || 0, minPrice, maxPrice),
    normalize(listing.bedrooms || 0, 0, 10),
    normalize(listing.bathrooms || 0, 0, 10),
    normalize(listing.area || 0, minArea, maxArea),
  ];

  // Categorical one-hot features
  const typeVector = types.map(t => (t === listing.type ? 1 : 0));
  const cityVector = cities.map(c => (c === listing.city ? 1 : 0));
  const countryVector = countries.map(c => (c === listing.country ? 1 : 0));

  // Amenities as binary vector
  const allAmenities = [
    ...new Set(allListings.flatMap(l => (l.amenities?.[0]?.split(",") || []))),
  ];
  const amenitiesVector = allAmenities.map(a =>
    listing.amenities?.[0]?.split(",").includes(a) ? 1 : 0
  );

  return [...numericVector, ...typeVector, ...cityVector, ...countryVector, ...amenitiesVector];
}

// Cosine similarity
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// GET /recommendations/:listingId
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const targetListing = await Listing.findById(listingId);
    if (!targetListing) return res.status(404).json({ message: "Listing not found" });

    const allListings = await Listing.find({ _id: { $ne: listingId } });

    const targetVector = await buildVector(targetListing, allListings);

    const scored = await Promise.all(
      allListings.map(async (l) => {
        const vector = await buildVector(l, allListings);
        const score = cosineSimilarity(targetVector, vector);
        return { ...l._doc, score };
      })
    );

    const recommended = scored.sort((a, b) => b.score - a.score).slice(0, 5);
    res.json(recommended);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
