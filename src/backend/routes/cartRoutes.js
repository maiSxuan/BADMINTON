const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticate, authorizeRole("USER"));

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:variant_id', cartController.updateCartItem);
router.delete('/:variant_id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);
router.delete('/items/bulk', cartController.removeSelectedItems);

module.exports = router


