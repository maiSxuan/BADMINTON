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

// quantity change = -2 -> giảm stock 2, = 2 -> tăng stock 2
exports.updateStockByIds = async (req, res) => {
    try {
        const { product_id, variant_id, option_id, quantity_change } = req.body;

        // Kiểm tra tính hợp lệ của ObjectId
        if (![product_id, variant_id, option_id].every(mongoose.Types.ObjectId.isValid)) {
            return res.status(400).json({ message: 'ID không hợp lệ.' });
        }

        const result = await Product.updateOne(
            {
                _id: product_id,
                "variants.variant_id": variant_id,
                "variants.options.option_id": option_id
            },
            {
                $inc: {
                    "variants.$[variant].options.$[opt].stock_quantity": quantity_change
                }
            },
            {
                arrayFilters: [
                    { "variant.variant_id": new mongoose.Types.ObjectId(variant_id) },
                    { "opt.option_id": new mongoose.Types.ObjectId(option_id) }
                ]
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy variant/option tương ứng trong sản phẩm.' });
        }

        res.status(200).json({ message: 'Cập nhật tồn kho thành công.' });

    } catch (error) {
        console.error("Lỗi khi cập nhật stock_quantity:", error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật tồn kho', error: error.message });
    }
};
 
// GET stock
exports.getStockByIds = async (req, res) => {
    try {
        const { product_id, variant_id, option_id } = req.query;

        // Kiểm tra hợp lệ
        if (![product_id, variant_id, option_id].every(mongoose.Types.ObjectId.isValid)) {
            return res.status(400).json({ message: 'ID không hợp lệ.' });
        }

        // Lấy sản phẩm với chỉ trường cần thiết
        const product = await Product.findOne(
            {
                _id: product_id,
                "variants.variant_id": variant_id,
                "variants.options.option_id": option_id
            },
            {
                "variants.$": 1 // chỉ lấy variant khớp
            }
        );

        if (!product || !product.variants || product.variants.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc biến thể.' });
        }

        // Tìm đúng option
        const variant = product.variants[0];
        const option = variant.options.find(opt => opt.option_id.toString() === option_id);

        if (!option) {
            return res.status(404).json({ message: 'Không tìm thấy option.' });
        }

        res.status(200).json({
            stock_quantity: option.stock_quantity
        });

    } catch (error) {
        console.error("Lỗi khi lấy stock_quantity:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy tồn kho', error: error.message });
    }
};
