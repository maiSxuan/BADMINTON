const express = require('express')
const router = express.Router()
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController')
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, createOrder)
router.get('/', authenticate, getAllOrders); 
router.put('/:orderId/status', updateOrderStatus); 
module.exports = router
