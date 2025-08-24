const express = require('express');
const router = express.Router();

const {
  getOrderStatistics,
  getRevenueStatistics,
  getTopSellingProducts,
  getLowStockAlerts
} = require('../controllers/dashboardController');

router.get('/stats/orders', getOrderStatistics);
router.get('/stats/revenue', getRevenueStatistics);
router.get('/stats/top-selling', getTopSellingProducts);
router.get('/stats/low-stock', getLowStockAlerts);

module.exports = router;