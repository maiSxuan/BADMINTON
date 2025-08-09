const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
