// models/ProductItemModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductItemSchema = new Schema({
  name: { type: String, required: [true, 'Tên sản phẩm là bắt buộc'] },
  product_id: {
    type: String,
    ref: 'Product',
    required: [true, 'ID sản phẩm cha là bắt buộc']
  },
  SKU: { type: String, required: true, unique: true },
  qty_in_stock: { type: Number, required: true, default: 0 },
  product_image: { type: [String], required: true },
  price: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductItem', ProductItemSchema);