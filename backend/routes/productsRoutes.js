const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
module.exports = router;

const {
    createProduct,
    getAllProducts,
    getProductBySlug,
    updateProductBySlug,
    togglePublishStatusBySlug,
    deleteProductBySlug,
    getSaleProductsGrouped
} = require('../controllers/productController');


// --- SẮP XẾP LẠI CHO ĐÚNG THỨ TỰ ---

// 1. READ
// Route chung nhất nên đặt trước
router.get('/', getAllProducts);
// lấy sản phẩm khuyến mãi
router.get('/sale-off', getSaleProductsGrouped);
// Route cụ thể hơn (có tham số) đặt sau
router.get('/:slug', getProductBySlug); 
router.put('/:slug', updateProductBySlug);
// 2. CREATE
router.post('/', createProduct);

// 3. UPDATE
router.patch('/:slug/toggle-publish', togglePublishStatusBySlug);

// 4. DELETE
router.delete('/:slug', deleteProductBySlug);


module.exports = router;
