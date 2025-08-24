    const Product = require('../models/Product');
    const Brand = require('../models/Brand');
    const Category = require('../models/Category');
    const Promotion = require('../models/Promotion');
    const mongoose = require('mongoose');
    const slugify = require('slugify');
    const cloudinary = require('../config/cloudinary');
    const PRICE_RANGES = { 'range1': { min: 0, max: 500000 }, 'range2': { min: 500000, max: 1000000 }, 'range3': { min: 1000000, max: 2000000 }, 'range4': { min: 2000000, max: 3000000 }, 'range5': { min: 3000000, max: Infinity } };
    const CHAR_LIMITS = {
    NAME: 200,
    DESCRIPTION: 5000,
    BRAND: 100,     
    CATEGORY: 100,  
    CLASSIFICATION_NAME: 50,
    OPTION_VALUE: 100,
    SKU: 50,
};
const validateProductDataLengths = (data) => {
    if (data.name && data.name.length > CHAR_LIMITS.NAME) {
        return `Tên sản phẩm không được vượt quá ${CHAR_LIMITS.NAME} ký tự.`;
    }
    if (data.description && data.description.length > CHAR_LIMITS.DESCRIPTION) {
        return `Mô tả sản phẩm không được vượt quá ${CHAR_LIMITS.DESCRIPTION} ký tự.`;
    }
    if (data.classification_config) {
        for (const config of data.classification_config) {
            if (config.name && config.name.length > CHAR_LIMITS.CLASSIFICATION_NAME) {
                return `Tên nhóm phân loại "${config.name}" không được vượt quá ${CHAR_LIMITS.CLASSIFICATION_NAME} ký tự.`;
            }
        }
    }
    if (data.variants) {
        for (const variant of data.variants) {
            if (variant.name && variant.name.length > CHAR_LIMITS.OPTION_VALUE) {
                return `Tên lựa chọn "${variant.name}" không được vượt quá ${CHAR_LIMITS.OPTION_VALUE} ký tự.`;
            }

            if (variant.options) {
                for (const option of variant.options) {
                    if (option.value && option.value.length > CHAR_LIMITS.OPTION_VALUE) {
                        return `Tên lựa chọn "${option.value}" không được vượt quá ${CHAR_LIMITS.OPTION_VALUE} ký tự.`;
                    }
                    if (option.sku_code && option.sku_code.length > CHAR_LIMITS.SKU) {
                        return `Mã SKU "${option.sku_code}" không được vượt quá ${CHAR_LIMITS.SKU} ký tự.`;
                    }
                }
            }
        }
    }

    return null; 
};
const validateUniqueSkus = (data) => {
    if (!data.variants || data.variants.length === 0) {
        return null;
    }
    const allSkus = data.variants.flatMap(variant => 
        (variant.options || []).map(option => option.sku_code)
    );
    const nonEmptySkus = allSkus.filter(sku => sku && sku.trim() !== '');
    const uniqueSkus = new Set(nonEmptySkus);

    if (uniqueSkus.size < nonEmptySkus.length) {
        const seen = new Set();
        for (const sku of nonEmptySkus) {
            if (seen.has(sku)) {
                return `Mã SKU "${sku}" bị trùng lặp. Mỗi phiên bản sản phẩm phải có một mã SKU duy nhất.`;
            }
            seen.add(sku);
        }
    }

    return null; 
};
    exports.createProduct = async (req, res) => {
        try {
            const productData = req.body;
            const lengthValidationError = validateProductDataLengths(productData);
            if (lengthValidationError) {
                return res.status(400).json({ message: lengthValidationError });
            }
            const skuValidationError = validateUniqueSkus(productData);
            if (skuValidationError) {
                return res.status(400).json({ message: skuValidationError });
            }
            if (!productData.name) return res.status(400).json({ message: "Tên sản phẩm là bắt buộc." });
            if (!productData.brand) return res.status(400).json({ message: "Thương hiệu là bắt buộc." });
            if (!productData.category_ids || productData.category_ids.length === 0) return res.status(400).json({ message: "Ngành hàng là bắt buộc." });

            productData.slug = slugify(productData.name, { lower: true, strict: true, locale: 'vi' });

            const existingProduct = await Product.findOne({ slug: productData.slug });
            if (existingProduct) return res.status(409).json({ message: `Sản phẩm với tên "${productData.name}" đã tồn tại.` });

            let lowestPrice = Infinity;
            (productData.variants || []).forEach(v => (v.options || []).forEach(o => {
                const price = Number(o.price);
                if (!isNaN(price) && price < lowestPrice) {
                    lowestPrice = price;
                }
            }));
            productData.price = lowestPrice === Infinity ? 0 : lowestPrice;
            const newProduct = new Product(productData);
            await newProduct.save();

            res.status(201).json(newProduct);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ message: messages.join(' ') });
            }
            console.error("Lỗi khi tạo sản phẩm:", error);
            res.status(500).json({ message: "Lỗi server khi tạo sản phẩm.", error: error.message });
        }
    };


    exports.getAllProducts = async (req, res) => {
        try {
            const { page = 1, limit = 1000, brands, categories, price, sort = 'newest', view = 'public', search = '' } = req.query;
            const brandSlugs = brands ? brands.split(',') : [];
            const categorySlugs = categories ? categories.split(',') : [];
            const filterCriteria = {};

            if (view === 'public') filterCriteria.is_published = true;

            if (search) {
                filterCriteria.name = { $regex: search.trim(), $options: 'i' };
            }

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

            const now = new Date();
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const promotions = await Promotion.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: todayEnd }
            }).lean();
            // console.log(todayEnd)

            const discountMap = new Map();
            promotions.forEach(promo => {
                promo.productDiscounts.forEach(pd => {
                    const promoCode = promo.listCode.find(c => c.code === pd.code && c.isActive);
                    if (promoCode) {
                        discountMap.set(pd.productId.toString(), {
                            discountType: promoCode.discountType,
                            discountValue: promoCode.discountValue
                        });
                    }
                });
            });

            const formattedProducts = productDocs.map(p => {

                const totalStock = (p.variants || []).reduce((t, v) => t + (v.options || []).reduce((s, o) => s + o.stock_quantity, 0), 0);
                const discountInfo = discountMap.get(p._id.toString()) || { discountType: null, discountValue: 0 };

                let salePrice = p.price;
                let isOnSale = false;

                if (discountInfo.discountType === 'percentage') {
                    salePrice = Math.round(p.price * (1 - discountInfo.discountValue / 100));
                    if (salePrice < p.price) isOnSale = true;
                } else if (discountInfo.discountType === 'fixed') {
                    salePrice = Math.max(p.price - discountInfo.discountValue, 0);
                    if (salePrice < p.price) isOnSale = true;
                }

                return {
                    id: p._id, slug: p.slug, name: p.name, price: p.price, sale: isOnSale, sale_price: salePrice,
                    brand: p.brand?.name || 'N/A', prod: p.category_ids?.[0]?.name || 'N/A',
                    imageUrl: p.thumbnail_url, description: p.description, variants: p.variants,
                    stock: totalStock, is_published: p.is_published, discountType: discountInfo.discountType, discountValue: discountInfo.discountValue
                };
            });

            res.status(200).json({ data: formattedProducts, pagination: { currentPage: Number(page), totalPages: Math.ceil(totalProducts / limit), totalProducts } });
        } catch (error) {
            console.error("Lỗi trong getAllProducts:", error);
            res.status(500).json({ message: "Lỗi server.", error: error.message });
        }
    };

    exports.getProductBySlug = async (req, res) => {
        try {
            const { view = 'public' } = req.query;
            const filter = { slug: req.params.slug };

            if (view !== 'admin') {
                filter.is_published = true;
            }

            const product = await Product.findOne(filter)
                .populate('brand', 'name slug _id')
                .populate('category_ids', 'name slug _id');

            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc sản phẩm đã bị ẩn.' });
            }

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const promotions = await Promotion.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: todayStart }
            }).lean();
            // console.log(todayStart)

            const discountMap = new Map();
            promotions.forEach(promo => {
                promo.productDiscounts.forEach(pd => {
                    const promoCode = promo.listCode.find(c => c.code === pd.code && c.isActive);
                    if (promoCode) {
                        discountMap.set(pd.productId.toString(), {
                            discountType: promoCode.discountType,
                            discountValue: promoCode.discountValue
                        });
                    }
                });
            });

            const discountInfo = discountMap.get(product._id.toString()) || { discountType: null, discountValue: 0 };

            let salePrice = product.price;
            let isOnSale = false;

            if (discountInfo.discountType === 'percentage') {
                salePrice = Math.round(product.price * (1 - discountInfo.discountValue / 100));
                if (salePrice < product.price) isOnSale = true;
            } else if (discountInfo.discountType === 'fixed') {
                salePrice = Math.max(product.price - discountInfo.discountValue, 0);
                if (salePrice < product.price) isOnSale = true;
            }

            product.sale_price = salePrice;
            product.sale = isOnSale;

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

        const lengthValidationError = validateProductDataLengths(productData);
        if (lengthValidationError) {
            return res.status(400).json({ message: lengthValidationError });
        }
        const skuValidationError = validateUniqueSkus(productData);
        if (skuValidationError) {
            return res.status(400).json({ message: skuValidationError });
        }
        const productToUpdate = await Product.findOne({ slug });
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        if (productData.name && productData.name !== productToUpdate.name) {
            productData.slug = slugify(productData.name, { lower: true, strict: true, locale: 'vi' });
            const existing = await Product.findOne({ slug: productData.slug, _id: { $ne: productToUpdate._id } });
            if (existing) {
                return res.status(409).json({ message: `Tên sản phẩm "${productData.name}" đã được sử dụng.` });
            }
        }

        let lowestPrice = Infinity;
        (productData.variants || []).forEach(v => (v.options || []).forEach(o => {
            const price = Number(o.price);
            if (!isNaN(price) && price < lowestPrice) {
                lowestPrice = price;
            }
        }));
        productData.price = lowestPrice === Infinity ? (productToUpdate.price || 0) : lowestPrice;

        const updatedProduct = await Product.findByIdAndUpdate(
            productToUpdate._id,
            productData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(' ') });
        }
        console.error("Lỗi server khi cập nhật:", error);
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
                    if (!url) return null;
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

    exports.getSaleProductsGrouped = async (req, res) => {
        try {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const promotions = await Promotion.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: todayStart }
            })
                .populate({
                    path: 'productDiscounts.productId',
                    match: { sale: true, is_published: true },
                    select: 'name slug thumbnail_url price sale_price sale appliedCode'
                })
                .lean();

            const result = promotions
                .map(promo => {
                    const productsWithDiscount = promo.productDiscounts
                        .map(pd => {
                            const product = pd.productId;
                            if (!product) return null;

                            const promoCode = promo.listCode.find(c => c.code === pd.code && c.isActive)
                            if (!promoCode) return product;

                            return {
                                ...product,
                                discountType: promoCode.discountType,
                                discountValue: promoCode.discountValue
                            };
                        })
                        .filter(Boolean);

                    return {
                        promotion_id: promo._id,
                        promotion_name: promo.name,
                        description: promo.description,
                        start_date: promo.startDate,
                        end_date: promo.endDate,
                        products: productsWithDiscount
                    }
                })
                .filter(Boolean);

            if (!result.length) {
                return res.json([]);
            }

            res.json(result);

        } catch (err) {
            console.error('Error fetching sale products grouped:', err);
            res.status(500).json({ message: 'Lỗi server.' });
        }
    };
