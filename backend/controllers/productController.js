const Product = require('../models/ProductModel');
const Brand = require('../models/brandModel'); 
const Category = require('../models/CategoryModel'); 
const mongoose = require('mongoose');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary'); 

const PRICE_RANGES = { 'range1': { min: 0, max: 500000 }, 'range2': { min: 500000, max: 1000000 }, 'range3': { min: 1000000, max: 2000000 }, 'range4': { min: 2000000, max: 3000000 }, 'range5': { min: 3000000, max: Infinity } };
const DEFAULT_PAGE_LIMIT = 9;

exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
        if (!productData.name) return res.status(400).json({ message: "Tên sản phẩm là bắt buộc." });
        productData.slug = slugify(productData.name, { lower: true, strict: true, locale: 'vi' });
        const existingProduct = await Product.findOne({ slug: productData.slug });
        if (existingProduct) return res.status(409).json({ message: `Sản phẩm "${productData.name}" đã tồn tại.` });
        let lowestPrice = Infinity;
        (productData.variants || []).forEach(v => (v.options || []).forEach(o => { if (o.price < lowestPrice) lowestPrice = o.price; }));
        productData.price = lowestPrice === Infinity ? 0 : lowestPrice;
        productData.is_published = false;
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi tạo sản phẩm.", error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 1000, brands, categories, price, sort = 'newest', view = 'public' } = req.query;
        const brandSlugs = brands ? brands.split(',') : [];
        const categorySlugs = categories ? categories.split(',') : [];
        const filterCriteria = {};
        if (view === 'public') filterCriteria.is_published = true;
        if (price && PRICE_RANGES[price]) {
            const { min, max } = PRICE_RANGES[price];
            filterCriteria.price = { $gte: min };
            if (max !== Infinity) filterCriteria.price.$lt = max;
        }
        const [brandIdObjects, categoryIdObjects] = await Promise.all([
            brandSlugs.length > 0 ? Brand.find({ slug: { $in: brandSlugs } }).select('_id').lean() : Promise.resolve([]),
            categorySlugs.length > 0 ? Category.find({ slug: { $in: categorySlugs } }).select('_id').lean() : Promise.resolve([])
        ]);
        if (brandIdObjects?.length > 0) filterCriteria.brand = { $in: brandIdObjects.map(b => b._id) };
        if (categoryIdObjects?.length > 0) filterCriteria.category_ids = { $in: categoryIdObjects.map(c => c._id) };
        let sortOptions = {};
        switch (sort) {
            case 'price-asc': sortOptions = { price: 1 }; break;
            case 'price-desc': sortOptions = { price: -1 }; break;
            default: sortOptions = { createdAt: -1 }; break;
        }
        const [totalProducts, productDocs] = await Promise.all([
            Product.countDocuments(filterCriteria),
            Product.find(filterCriteria).sort(sortOptions).skip((page - 1) * limit).limit(Number(limit))
                .populate('brand').populate('category_ids').lean()
        ]);
        const formattedProducts = productDocs.map(p => {
            const totalStock = (p.variants || []).reduce((t, v) => t + (v.options || []).reduce((s, o) => s + o.stock_quantity, 0), 0);
            return {
                id: p._id, slug: p.slug, name: p.name, price: p.price,
                brand: p.brand?.name || 'N/A', prod: p.category_ids?.[0]?.name || 'N/A',
                imageUrl: p.thumbnail_url, description: p.description, variants: p.variants,
                stock: totalStock, is_published: p.is_published,
            };
        });
        res.status(200).json({ data: formattedProducts, pagination: { currentPage: Number(page), totalPages: Math.ceil(totalProducts / limit), totalProducts } });
    } catch (error) {
        console.error("Lỗi trong getAllProducts:", error);
        res.status(500).json({ message: "Lỗi server.", error: error.message });
    }
}

exports.getProductBySlug = async (req, res) => {
    try {
        const { view = 'public' } = req.query;
        const filter = { slug: req.params.slug };
        
        // Luôn luôn chỉ tìm các sản phẩm chưa bị xóa mềm (nếu bạn có trường is_deleted)
        // filter.is_deleted = false;

        if (view === 'public') {
            filter.is_published = true;
        }

        const product = await Product.findOne(filter).populate('brand').populate('category_ids');
        
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc sản phẩm đã bị ẩn.' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

exports.updateProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const productData = req.body;
        const productToUpdate = await Product.findOne({ slug });
        if (!productToUpdate) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        if (productData.name && productData.name !== productToUpdate.name) {
            productData.slug = slugify(productData.name, { lower: true, strict: true, locale: 'vi' });
            const existing = await Product.findOne({ slug: productData.slug, _id: { $ne: productToUpdate._id } });
            if (existing) return res.status(409).json({ message: `Tên "${productData.name}" đã tồn tại.` });
        }
        let lowestPrice = Infinity;
        (productData.variants || []).forEach(v => (v.options || []).forEach(o => { if (o.price < lowestPrice) lowestPrice = o.price; }));
        productData.price = lowestPrice === Infinity ? (productToUpdate.price || 0) : lowestPrice;
        const updatedProduct = await Product.findByIdAndUpdate(productToUpdate._id, productData, { new: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi cập nhật.", error: error.message });
    }
};

exports.togglePublishStatusBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug });
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        product.is_published = !product.is_published;
        await product.save();
        res.status(200).json({ message: `Cập nhật thành công.`, product: { id: product._id, slug: product.slug, is_published: product.is_published } });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server.", error: error.message });
    }
};

exports.deleteProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const productToDelete = await Product.findOne({ slug });
        if (!productToDelete) return res.status(200).json({ message: 'Sản phẩm không tồn tại.' });
        const publicIds = new Set();
        const getPublicId = (url) => {
            try {
                if(!url) return null;
                const parts = url.split('/'); const uploadIndex = parts.indexOf('upload');
                if (uploadIndex === -1 || uploadIndex + 2 > parts.length) return null;
                const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
                return publicIdWithVersion.substring(0, publicIdWithVersion.lastIndexOf('.'));
            } catch { return null; }
        };
        if (productToDelete.thumbnail_url) publicIds.add(getPublicId(productToDelete.thumbnail_url));
        (productToDelete.variants || []).forEach(v => (v.images || []).forEach(img => publicIds.add(getPublicId(img))));
        const idsArray = Array.from(publicIds).filter(Boolean);
        if (idsArray.length > 0) await cloudinary.api.delete_resources(idsArray);
        await Product.findByIdAndDelete(productToDelete._id);
        res.status(200).json({ message: 'Xóa sản phẩm vĩnh viễn thành công.' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa.", error: error.message });
    }
};
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