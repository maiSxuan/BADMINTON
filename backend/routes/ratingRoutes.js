const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

// POST /ratings
router.post('/createRating', ratingController.createRating);

// GET /ratings/product/:productId
router.get('/product/:productId', ratingController.getRatingsByProduct);

module.exports = router;
