const Product = require('../models/productModel2'); // Sử dụng model đã thống nhất


exports.getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const product = await Product.findOne({ slug })
            .populate('brand')
            .populate('category_ids');

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// Export hàm ra để router có thể sử dụng
// module.exports = {
//     getProductBySlug
// };