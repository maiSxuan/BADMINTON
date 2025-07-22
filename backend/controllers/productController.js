const Product = require('../models/ProductModel');
const Brand = require('../models/brandModel');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Dùng exports.tên_hàm để export
exports.createProduct = async (req, res) => {
    try {
        const { name, brand, variants, ...otherData } = req.body;

        if (!name || !brand) {
            return res.status(400).json({ message: "Tên sản phẩm và thương hiệu là bắt buộc." });
        }
        
        const slug = slugify(name, { lower: true, strict: true });
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return res.status(409).json({ message: `Sản phẩm với tên "${name}" đã tồn tại.` });
        }

        let brandId;

        if (mongoose.Types.ObjectId.isValid(brand)) {
            brandId = brand;
        } else {
            const brandName = brand;
            const brandSlug = slugify(brandName, { lower: true, strict: true });
            let existingBrand = await Brand.findOne({ slug: brandSlug });

            if (existingBrand) {
                brandId = existingBrand._id;
            } else {
                const newBrand = new Brand({ name: brandName, slug: brandSlug });
                await newBrand.save();
                brandId = newBrand._id;
            }
        }

        const productData = {
            ...otherData,
            name,
            slug,
            brand: brandId,
            variants
        };

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
        console.error("Lỗi khi tạo sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi tạo sản phẩm", error: error.message });
    }
};

// Dùng exports.tên_hàm để export
exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, is_published: true })
            .populate('brand', 'name')
            .populate('category_ids', 'name');

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// (Thêm hàm này nếu bạn cần cho trang danh sách sản phẩm)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ is_published: true })
            .populate('brand', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}