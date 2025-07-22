const express = require('express');
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const { getProductBySlug } = require('../controllers/productController');
router.get('/:slug', getProductBySlug);

module.exports = router;

const {
    getProductBySlug,
    createProduct
} = require('../controllers/productController');


router.post('/', createProduct);


router.get('/:slug', getProductBySlug);


module.exports = router;
