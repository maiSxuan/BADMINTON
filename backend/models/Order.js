const mongoose = require('mongoose');
const { Schema } = mongoose;
const {itemSchema} = require('./Cart'); // 👈 import schema con

// Schema chính của đơn hàng
const OrderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
  total_amount: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  picked_up_at: { type: String },                         // địa chỉ khách nhận
  delivered_at: { type: Date },                           // thời gian giao
  note: { type: String },

  status: {
    type: String,
    enum: [
      'Chờ xác nhận', 'Chờ thanh toán', 'Chờ lấy', 'Đang vận chuyển',
      'Đang giao', 'Đã giao', 'Hoàn thành', 'Đã hủy', 'Trả hàng/hoàn tiền'
    ],
    default: 'Chờ xác nhận'
  },

  phone_number: { type: String },
  cancellation_reason: { type: String },
  return_reason: { type: String },
  payment_method: { type: String },
  shipping_provider: { type: String }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
