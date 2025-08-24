const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', authorizeRole("USER"), orderController.createOrder)
router.get('/', authorizeRole("ADMIN"), orderController.getAllOrders)
router.put('/:orderId/status', orderController.updateOrderStatus)
router.get('/cancellation-orders', authorizeRole("ADMIN"), orderController.getCancelledReqOrders)
router.get('/return-refund-orders', authorizeRole("ADMIN"), orderController.getReturnRefundReqOrders)
router.get('/user/:userId', authorizeRole("USER"), orderController.getOrdersByUserId)
router.put('/request/:orderId', authorizeRole("USER"), orderController.requestReturnOrCancel)
module.exports = router
