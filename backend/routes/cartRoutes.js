const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');


router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, cartController.addToCart);
router.delete('/:productVariantId', verifyToken, cartController.removeCartItem);
router.patch('/', verifyToken, cartController.updateCartItem);

module.exports = router


