const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/brandController');

router.get('/', categoryController.getAllBrands);
router.post('/', categoryController.createBrand);

module.exports = router;