const Product = require('../models/ProductModel');
// SỬA LẠI DÒNG NÀY: DÙNG DẤU GẠCH CHÉO '/' THAY VÌ DẤU CHẤM '.'
const ProductItem = require('../models/ProductItemModel');

exports.getProductDetailsById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    const variants = await ProductItem.find({ product_id: productId });

    res.status(200).json({
      success: true,
      product: product,
      variants: variants
    });

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};