const express = require('express');
const router = express.Router();
const House = require("../models/Listing");

// GET /api/houses?location=Kathmandu&minPrice=500&maxPrice=1500
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    const houses = await House.find(filter);
    res.json(houses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
