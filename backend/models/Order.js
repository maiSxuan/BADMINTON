const mongoose = require('mongoose');
const { Schema } = mongoose;

// Item trong đơn hàng
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant_name: { type: String, required: true },         // ví dụ: "Xanh dương"
  sku_code: { type: String, required: true },             // ví dụ: "YONEX700-XL"
  size: { type: String, required: true },                 // option size: M, L, XL,...
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },                // giá tại thời điểm mua
  list_price: { type: Number },                           // giá gốc nếu có
  thumbnail_url: { type: String }
}, { _id: false });

// Schema chính của đơn hàng
const OrderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
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
