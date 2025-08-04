const mongoose = require('mongoose');
const { Schema } = mongoose;
const {itemSchema} = require('./Cart'); 

const ShippingInfoSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  district: { type: String },
  ward: { type: String },
  houseNumber: { type: String },
  saveInfo: { type: Boolean, default: false }
});
// Schema chính của đơn hàng
const OrderSchema = new Schema({
  user_id: { type: String, ref: 'User', required: true },
  shippingInfo: ShippingInfoSchema,
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
      'Đang giao', 'Đã giao', 'Hoàn thành', 'Yêu cầu hủy', 'Đã hủy', 'Yêu cầu trả hàng/hoàn tiền', 'Tiến hành trả hàng/hoàn tiền', 'Đã trả hàng/hoàn tiền'
    ],
    default: 'Chờ xác nhận'
  },

  cancellation_reason: { type: String },
  return_reason: { type: String },
  payment_method: { type: String },
  shipping_provider: { type: String }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
