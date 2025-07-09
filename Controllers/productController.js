const Product = require ('../models/ProductModel');
const ProductItem = require ('../models/ProductItemModel')

exports.getProductDetailsById = async (req, res) => {
  try {
    const product = await Product.findById(req.body.id);

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Truy vấn tất cả ProductItem có product_id trùng (dùng regex nếu cần gần đúng)
    const variants = await ProductItem.find({ product_id: { $regex: `${req.body.id}` } });
    console.log(variants)
    // Trả về cả hai
    res.status(200).json({
      product,
      variants
    });

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
