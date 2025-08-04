const express = require('express');
const router = express.Router();
const cloudinary = require("../config/cloudinary");

module.exports = router;

const {
    createProduct,
    getAllProducts,
    getProductBySlug,
    updateProductBySlug,
    togglePublishStatusBySlug,
    deleteProductBySlug
} = require('../controllers/productController');


// --- SẮP XẾP LẠI CHO ĐÚNG THỨ TỰ ---

// 1. READ
// Route chung nhất nên đặt trước
router.get('/', getAllProducts);
// Route cụ thể hơn (có tham số) đặt sau
router.get('/:slug', getProductBySlug); 

// 2. CREATE
router.post('/', createProduct);

// 3. UPDATE
router.put('/:slug', updateProductBySlug);
router.patch('/:slug/toggle-publish', togglePublishStatusBySlug);

// 4. DELETE
router.delete('/:slug', deleteProductBySlug);

module.exports = router;
