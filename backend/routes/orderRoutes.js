const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /orders - Tạo đơn hàng (đặt status là 'delivered' để test rating)
router.post('/', async (req, res) => {
  try {
    const { user, items, shipping_address, phone_number, total_amount } = req.body;

    const order = new Order({
      user,
      items,
      shipping_address,
      phone_number,
      total_amount,
      status: 'delivered', // Giao hàng luôn để test
      delivered_at: new Date()
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
