const Order = require('../models/Order')

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      orderNote,
      deliveryMethod,
      shippingInfo
    } = req.body

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" })
    }

    const shippingProviderMap = {
      'nhanh': 'Giao hàng tiết kiệm',
      'sieu-toc': 'J&T Express',
      'tai-cua-hang': 'Tự đến lấy'
    }

    const newOrder = new Order({
      user_id: userId,
      items: items.map(item => ({
        product: item.product,
        variant_name: item.variant_name,
        sku_code: item.sku_code,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        list_price: item.list_price || item.price,
        thumbnail_url: item.thumbnail_url || ""
      })),
      total_amount: totalAmount,
      picked_up_at: shippingInfo?.address || "",
      phone_number: shippingInfo?.phone || "",
      note: orderNote,
      shipping_provider: shippingProviderMap[deliveryMethod] || "Không xác định",
      payment_method: 'COD',
      status: 'Chờ xác nhận',
      created_at: new Date()
    })

    await newOrder.save()

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      orderId: newOrder._id
    })
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error)
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo đơn hàng' })
  }
}

const getAllOrders = async (req, res) => {
  try {
    // console.log('getAllOrders được gọi');
    const orders = await Order.find();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách đơn hàng' });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'Chờ xác nhận', 'Chờ thanh toán', 'Chờ lấy', 'Đang vận chuyển',
      'Đang giao', 'Đã giao', 'Hoàn thành', 'Đã hủy', 'Trả hàng/hoàn tiền'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', order });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};

