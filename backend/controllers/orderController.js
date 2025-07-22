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
module.exports = { createOrder }
