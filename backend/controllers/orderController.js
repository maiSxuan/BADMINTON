const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')
// const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       items,
//       totalAmount,
//       orderNote,
//       deliveryMethod,
//       shippingInfo
//     } = req.body;

//     // if (!userId) {
//     //   return res.status(400).json({ message: "Thiếu userId" });
//     // }

//     const shippingProviderMap = {
//       'nhanh': 'Giao hàng tiết kiệm',
//       'sieu-toc': 'J&T Express',
//       'tai-cua-hang': 'Tự đến lấy'
//     };

//     // Kiểm tra tồn kho cho từng item
//     for (const item of items) {
//       const product = await Product.findById(item.product_id);
//       if (!product) {
//         return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
//       }

//       const variant = product.variants.id(item.variant_id);
//       if (!variant) {
//         return res.status(404).json({ success: false, message: 'Không tìm thấy biến thể sản phẩm' });
//       }

//       const option = variant.options.id(item.option_id);
//       if (!option) {
//         return res.status(404).json({ success: false, message: 'Không tìm thấy tuỳ chọn sản phẩm' });
//       }

//       if (option.stock_quantity < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Sản phẩm ${product.name} - ${variant.name} - size ${option.value} chỉ còn ${option.stock_quantity} sản phẩm`
//         });
//       }
//     }
//     const code = option.sku_code;
//     // Tạo đơn hàng
//     const newOrder = new Order({
//       user_id: userId,
//       items: items.map(item => ({
//         product_id: item.product_id,
//         variant_id: item.variant_id,
//         option_id: item.option_id,
//         sku_code: code,
//         quantity: item.quantity,
//         priceAtTime: item.price
//       })),
//       total_amount: totalAmount,
//       picked_up_at: shippingInfo?.address || "",
//       phone_number: shippingInfo?.phone || "",
//       note: orderNote,
//       shipping_provider: shippingProviderMap[deliveryMethod] || "Không xác định",
//       payment_method: 'COD',
//       status: 'Chờ xác nhận',
//       created_at: new Date()
//     });

//     await newOrder.save();

//     // Cập nhật tồn kho sau khi đơn được tạo thành công
//     for (const item of items) {
//       const product = await Product.findById(item.product_id);
//       const variant = product.variants.id(item.variant_id);
//       const option = variant.options.id(item.option_id);

//       option.stock_quantity -= item.quantity;
//       await product.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Tạo đơn hàng thành công',
//       orderId: newOrder._id
//     });

//   } catch (error) {
//     console.error('Lỗi khi tạo đơn hàng:', error);
//     res.status(500).json({ success: false, message: 'Lỗi server khi tạo đơn hàng' });
//   }
// };
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      orderNote,
      deliveryMethod,
      shippingInfo
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
        priceAtTime: item.priceAtTime
      });
    }

    const newOrder = new Order({
      user_id: userId,
      items: verifiedItems,
      total_amount: totalAmount,
      picked_up_at: shippingInfo?.address || "",
      phone_number: shippingInfo?.phone || "",
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

    // Lấy đơn hàng hiện tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Nếu trạng thái mới là "Đã hủy" và đơn trước đó chưa hủy → hoàn lại stock
    if (status === 'Đã hủy' && order.status !== 'Đã hủy') {
      for (const item of order.items) {
        const product = await Product.findById(item.product_id);
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

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};

