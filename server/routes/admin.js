const express = require('express');
const { loginAdmin } = require('../controllers/admincontroller');
const { getStats } = require('../controllers/admincontroller');
const { getAllUsers } = require('../controllers/admincontroller');
const router = express.Router();

router.post('/login', loginAdmin);
router.get('/stats', getStats);
router.get('/users', getAllUsers); 
module.exports = router;
