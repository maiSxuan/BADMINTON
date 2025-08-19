const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      shippingInfo,
      items,
      totalAmount,
      orderNote,
      deliveryMethod
    } = req.body;

    const shippingProviderMap = {
      'nhanh': 'Giao hàng tiết kiệm',
      'sieu-toc': 'J&T Express',
      'tai-cua-hang': 'Tự đến lấy'
    };

    // Mảng chứa thông tin đã đầy đủ sau khi kiểm tra tồn kho
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }

      const variant = product.variants.id(item.variant_id);
      if (!variant) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy biến thể sản phẩm' });
      }

      const option = variant.options.id(item.option_id);
      if (!option) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tuỳ chọn sản phẩm' });
      }

      if (option.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} - ${variant.name} - size ${option.value} chỉ còn ${option.stock_quantity} sản phẩm`
        });
      }

      // Nếu đã kiểm tra hợp lệ, lưu lại thông tin để tạo đơn hàng
      verifiedItems.push({
        product: new mongoose.Types.ObjectId(item.product_id),
        variant_id: new mongoose.Types.ObjectId(item.variant_id),
        option_id: new mongoose.Types.ObjectId(item.option_id),
        sku_code: option.sku_code,   
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        name: product.name,
        thumbnail_url: variant.images?.[0] || product.thumbnail_url 
      });
    }

    const newOrder = new Order({
      user_id: userId,
      shippingInfo: shippingInfo,
      items: verifiedItems,
      total_amount: totalAmount,
      picked_up_at: shippingInfo?.address || "",
      note: orderNote,
      shipping_provider: shippingProviderMap[deliveryMethod] || "Không xác định",
      payment_method: 'COD',
      status: 'Chờ xác nhận',
      created_at: new Date()
    });

    await newOrder.save();

    // Trừ tồn kho
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      const variant = product.variants.id(item.variant_id);
      const option = variant.options.id(item.option_id);

      option.stock_quantity -= item.quantity;
      await product.save();
    }

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      orderId: newOrder._id
    });

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo đơn hàng' });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const excludeStatuses = [
      "Yêu cầu hủy",
      // "Đã hủy",
      "Yêu cầu trả hàng/hoàn tiền",
      //"Tiến hành trả hàng/hoàn tiền",
      //"Đã trả hàng/hoàn tiền"
    ];

    const orders = await Order.find({ status: { $nin: excludeStatuses } }).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng thường:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng thường" });
  }
};


const getCancelledReqOrders = async (req, res) => {
  try {
    const returnStatuses = [
      "Yêu cầu hủy",
      "Đã hủy"
    ];
    const orders = await Order.find({status: { $in: returnStatuses }}).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng yêu cầu hủy:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng yêu cầu hủy" });
  }
}

const getReturnRefundReqOrders = async (req, res) => {
  try {
    const returnStatuses = [
      "Yêu cầu trả hàng/hoàn tiền",
      "Hoàn tất trả hàng/hoàn tiền"
    ];

    const orders = await Order.find({ status: { $in: returnStatuses } }).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng hoàn tiền:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng hoàn tiền" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
       'Chờ xác nhận', 'Chờ thanh toán', 'Chờ lấy', 'Đang vận chuyển',
      'Đang giao', 'Đã giao', 'Hoàn thành', 'Yêu cầu hủy', 'Đã hủy', 'Yêu cầu trả hàng/hoàn tiền', 
      'Tiến hành trả hàng/hoàn tiền', 'Đã trả hàng/hoàn tiền'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    // Lấy đơn hàng hiện tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (status === 'Đã hủy' && order.status !== 'Đã hủy') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        const variant = product.variants.id(item.variant_id);
        if (!variant) continue;

        const option = variant.options.id(item.option_id);
        if (!option) continue;

        option.stock_quantity += item.quantity; // Tăng lại số lượng
        await product.save();
      }
    }

    // Cập nhật trạng thái mới
    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', order });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái' });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 })
      .populate('items.product');

    const transformedOrders = orders.map(order => {
      const transformedItems = order.items.map(item => {
        const product = item.product;
        const variant = product?.variants?.id(item.variant_id);
        const option = variant?.options?.id(item.option_id);

        return {
          _id: item._id,
          productId: product?._id,
          variantId: item.variant_id,
          optionId: item.option_id,
          name: product?.name || 'Không xác định',
          image: variant?.images?.[0] || product?.thumbnail_url || '/placeholder.svg',
          quantity: item.quantity,
          price: item.priceAtTime,
          sku_code: item.sku_code,
          color: variant?.name || 'Không xác định',
          size: option?.value || 'Không xác định',
        };
      });

      return {
        _id: order._id,
        status: order.status,
        total: order.total,
        created_at: order.created_at,
        shippingInfo: order.shippingInfo,
        paymentMethod: order.paymentMethod,
        items: transformedItems,
      };
    });

    res.status(200).json({ success: true, data: transformedOrders });
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng theo user_id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đơn hàng theo người dùng',
    });
  }
};

const requestReturnOrCancel = async (req, res) => {
  try {
    const { orderId } = req.params
    const { type, reason } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (type === 'return') {
      order.status = 'Yêu cầu trả hàng/hoàn tiền'
      order.return_reason = reason
    } else if (type === 'cancel') {
      order.status = 'Yêu cầu hủy'
      order.cancellation_reason = reason
    } else {
      return res.status(400).json({ success: false, message: 'Loại yêu cầu không hợp lệ' })
    }

    await order.save()

    res.status(200).json({
      success: true,
      message: `Đã gửi yêu cầu ${type === 'return' ? 'trả hàng/hoàn tiền' : 'hủy đơn hàng'} thành công`,
      data: order,
    })
  } catch (error) {
    console.error('Lỗi khi xử lý yêu cầu:', error)
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi yêu cầu hủy/trả hàng',
    })
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getCancelledReqOrders,
  getReturnRefundReqOrders,
  getOrdersByUserId,
  requestReturnOrCancel
};

