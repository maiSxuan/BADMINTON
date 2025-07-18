const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  brand: String,
  category: {
    type: String,
    enum: ['Racket', 'Shoes', 'Clothing', 'Accessories'],
    required: true
  },
  variants: [variantSchema],
  total_views: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
