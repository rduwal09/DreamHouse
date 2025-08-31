const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// Get all reviews for a listing
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "name profileImagePath") // populate user info
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Get average rating for a listing
router.get("/:listingId/average", async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId });
    const count = reviews.length;
    const averageRating = count === 0 ? 0 : reviews.reduce((acc, r) => acc + r.rating, 0) / count;
    res.json({ averageRating, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch average rating" });
  }
});

// Post a new review
router.post("/", async (req, res) => {
  try {
    const { listingId, userId, rating, comment } = req.body;
    if (!listingId || !userId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const review = await Review.create({
      listing: listingId,
      user: userId,
      rating,
      comment,
    });

    const reviews = await Review.find({ listing: listingId });
    const count = reviews.length;
    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / count;

    res.status(201).json({ review, average: { averageRating, count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

module.exports = router;
