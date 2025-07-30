const express = require('express')
const router = express.Router()
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController')
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', createOrder)
router.get('/', getAllOrders); 
router.put('/:orderId/status', updateOrderStatus); 
module.exports = router
