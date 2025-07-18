const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product_item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      price: Number,
      quantity: Number
    }
  ],
  shipping_address: String,
  phone_number: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'canceled'],
    default: 'pending'
  },
  total_amount: Number,
  delivered_at: Date,
  canceled_at: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
