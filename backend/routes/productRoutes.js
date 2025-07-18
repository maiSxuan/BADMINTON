const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const router = express.Router();

// POST /products/item - tạo sản phẩm mới (có thể không có biến thể)
router.post('/item', async (req, res) => {
  try {
    const { name, description, brand, category, variants } = req.body;

    const processedVariants = Array.isArray(variants)
      ? variants.map(v => ({ _id: new mongoose.Types.ObjectId(), ...v }))
      : [];

    const product = new Product({
      name,
      description,
      brand,
      category,
      variants: processedVariants
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
