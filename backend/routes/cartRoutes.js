const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router


