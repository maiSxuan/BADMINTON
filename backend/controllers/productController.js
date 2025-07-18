const Product = require('../models/productModel2'); // Sử dụng model đã thống nhất


const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, is_published: true })
                                            .populate('brand') 
                                     .populate('category_ids'); 

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm bằng slug:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Export hàm ra để router có thể sử dụng
module.exports = {
    getProductBySlug
};