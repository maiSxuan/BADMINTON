const express = require('express');
const router = express.Router();

const {
    getProductBySlug,
    createProduct
} = require('../controllers/productController');

// ✅ Tạo mới sản phẩm
router.post('/', createProduct);

// ✅ Lấy chi tiết sản phẩm theo slug
router.get('/:slug', getProductBySlug);

module.exports = router;
