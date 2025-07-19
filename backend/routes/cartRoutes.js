const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addToCart);
router.delete('/:productVariantId', authMiddleware, cartController.removeCartItem);
router.patch('/', authMiddleware, cartController.updateCartItem);

module.exports = router


