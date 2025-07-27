const express = require('express');
const router = express.Router();
const cloudinary = require("../config/cloudinary");

module.exports = router;

const {
    getProductBySlug,
    createProduct, 
    updateStockByIds,
    getStockByIds
} = require('../controllers/productController');

router.post('/', createProduct);
router.patch('/update-stock', updateStockByIds);
router.get('/get-stock', getStockByIds);
router.get('/:slug', getProductBySlug); // để GET này cuối
module.exports = router;
