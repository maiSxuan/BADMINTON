// controllers/ratingController.js
const Rating = require('../models/Rating');
const Order = require('../models/Order');

// POST /ratings - Viết đánh giá
exports.createRating = async (req, res) => {
  try {
    const { orderId, productId, rating, comment, userId } = req.body;

    // 1. Kiểm tra order tồn tại, thuộc user, và đã giao
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ message: 'Không tìm thấy đơn hàng hoặc đơn hàng chưa được giao.' });
    }

    // 2. Kiểm tra sản phẩm có trong đơn hàng
    const productExists = order.items.some(item => String(item.product_item) === productId);
    if (!productExists) {
      return res.status(400).json({ message: 'Sản phẩm không tồn tại trong đơn hàng.' });
    }

    // 3. Kiểm tra đã đánh giá chưa
    const rated = await Rating.findOne({
      user: userId,
      order: orderId,
      product_item: productId
    });
    if (rated) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này.' });
    }

    // 4. Tạo đánh giá
    const newRating = new Rating({
      user: userId,
      order: orderId,
      product_item: productId,
      rating,
      comment
    });

    await newRating.save();
    res.status(201).json({ message: 'Đánh giá thành công', data: newRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /ratings/product/:productId - Lấy đánh giá theo sản phẩm
exports.getRatingsByProduct = async (req, res) => {
  try {
    const ratings = await Rating.find({ product_item: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
