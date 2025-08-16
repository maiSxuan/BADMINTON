const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');
router.use(authenticate, authorizeRole("USER"));

router.post('/', orderController.createOrder)
router.get('/', orderController.getAllOrders)
router.put('/:orderId/status', orderController.updateOrderStatus)
router.get('/cancellation-orders', orderController.getCancelledReqOrders)
router.get('/return-refund-orders', orderController.getReturnRefundReqOrders)
router.get('/user/:userId', orderController.getOrdersByUserId)
router.put('/request/:orderId', orderController.requestReturnOrCancel)
module.exports = router
