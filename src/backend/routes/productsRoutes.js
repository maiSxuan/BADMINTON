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

router.get('/', getAllProducts);
router.get('/sale-off', getSaleProductsGrouped);
router.get('/:slug', getProductBySlug); 
router.put('/:slug', updateProductBySlug);
router.post('/', createProduct);
router.patch('/:slug/toggle-publish', togglePublishStatusBySlug);
router.delete('/:slug', deleteProductBySlug);
module.exports = router;
