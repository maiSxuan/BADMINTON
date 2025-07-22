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
const Category = require('../models/CategoryModel');
const slugify = require('slugify');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 }); 
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, variants /*, ...các trường khác */ } = req.body;
        
        const productData = { ...req.body, slug: slugify(name, { lower: true, strict: true }) };
        let lowestPrice = Infinity;

        if (variants && variants.length > 0) {
            variants.forEach(variant => {
                if (variant.options && variant.options.length > 0) {
                    variant.options.forEach(option => {
                        if (option.price < lowestPrice) {
                            lowestPrice = option.price;
                        }
                    });
                }
            });
        }
        
        productData.price = lowestPrice === Infinity ? 0 : lowestPrice;


        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json(newProduct);

    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi tạo sản phẩm", error: error.message });
    }
};
module.exports = {
    getProductBySlug
};