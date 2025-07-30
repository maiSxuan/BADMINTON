const Promotion = require('../models/PromotionModel');
const Product = require('../models/ProductModel');
const mongoose = require('mongoose');

exports.createPromotion = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;

        if (new Date(startDate) >= new Date(endDate))
            return res.status(400).json({ message: 'Invalid timestamps' });

        const existing = await Promotion.findOne({ name: name.trim() });
        if (existing)
            return res.status(400).json({ message: 'Promotion already exists' })

        const newPromotion = new Promotion({
            name,
            description,
            startDate,
            endDate,
            // listCode: [],
            // productIds: [],
        });

        await newPromotion.save();

        return res.status(201).json({ message: 'Create promotion successfully', promotion: newPromotion });
    } catch (err) {
        console.error('Create promotions error:', err);
        res.status(500).json({ message: 'Create promotion failed' });
    }
};

exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find()
            .populate({
                path: 'productDiscounts.productId',
                select: 'name price sale sale_price thumbnail_url'
            })
            .sort({ createdAt: -1 })

        return res.status(200).json({ message: 'Get a list of successful promotional campaigns', promotions });
    } catch (err) {
        console.error('Get all promotions error', err);
        res.status(500).json({ message: 'Error when getting all promotions' });
    }
};

exports.getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await Promotion.findById(id).populate({
            path: 'productDiscounts.productId',
            select: 'name price sale sale_price thumbnail_url slug'
        });

        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        return res.status(200).json({ message: 'Get promotion information successfully', promotion });
    } catch (err) {
        console.error('Get promotion by ID error:', err);
        res.status(500).json({ message: 'Error when getting promotion by ID' });
    }
};

exports.updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate } = req.body;

        const existingPromotion = await Promotion.findById(id);
        if (!existingPromotion)
            return res.status(404).json({ message: 'Promotion not found' });

        const updatedStartDate = startDate ?? existingPromotion.startDate;
        const updatedEndDate = endDate ?? existingPromotion.endDate;

        if (new Date(updatedStartDate) >= new Date(updatedEndDate))
            return res.status(400).json({ message: 'Invalid timestamps' });

        existingPromotion.name = name ?? existingPromotion.name;
        existingPromotion.description = description ?? existingPromotion.description;
        existingPromotion.startDate = updatedStartDate;
        existingPromotion.endDate = updatedEndDate;

        const updated = await existingPromotion.save();
        return res.status(200).json({ message: 'Update promotion successfully', promotion: updated });
    } catch (err) {
        console.error('Update promotion error:', err);
        res.status(500).json({ message: 'Error when updating promotion' });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await Promotion.findById(id);
        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        await Promotion.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Delete promotion successfully' });
    } catch (err) {
        console.error('Delete promotion error:', err);
        res.status(500).json({ message: 'Error when deleting promotion' });
    }
};

exports.addCodesToPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const { codes } = req.body;

        if (!Array.isArray(codes) || codes.length === 0)
            return res.status(400).json({ message: 'List of codes is required' });

        const promotion = await Promotion.findById(promotionId);
        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        const existingCodes = promotion.listCode.map(c => c.code);
        const duplicateCodes = codes.filter(c => existingCodes.includes(c.code));
        if (duplicateCodes.length > 0)
            return res.status(400).json({ message: 'Duplicate codes detected', duplicates: duplicateCodes });

        promotion.listCode.push(...codes);
        await promotion.save();

        return res.status(200).json({ message: 'Codes added successfully', updatedPromotion: promotion });
    } catch (err) {
        console.error('Add codes error:', err);
        res.status(500).json({ message: 'Error when adding promotion code' });
    }
};

exports.removeCodesFromPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const { codes } = req.body;

        if (!Array.isArray(codes) || codes.length === 0)
            return res.status(400).json({ message: 'List of codes is required' });

        const promotion = await Promotion.findById(promotionId);
        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        const originalCnt = promotion.listCode.length;
        promotion.listCode = promotion.listCode.filter((codeObj) => !codes.includes(codeObj.code));

        const removeCnt = originalCnt - promotion.listCode.length;
        if (removeCnt === 0)
            return res.status(400).json({ message: 'Codes not exist' });

        await promotion.save();

        return res.status(200).json({ message: `Remove successfully ${removeCnt} promotion code`, updatedCodes: promotion.listCode });
    } catch (err) {
        console.error('Remove codes error:', err);
        res.status(500).json({ message: 'Error when removing promotion code' });
    }
};

// exports.addProductToPromotion = async (req, res) => {
//     try {
//         const { promotionId } = req.params;
//         const { productIds } = req.body;

//         if (!Array.isArray(productIds) || productIds.length === 0)
//             return res.status(400).json({ message: 'Invalid productIds' });

//         const validProductIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
//         if (validProductIds.length === 0)
//             return res.status(400).json({ message: 'All productIds are invalid' });

//         const promotion = await Promotion.findById(promotionId);
//         if (!promotion)
//             return res.status(404).json({ message: 'Promotion not found' });

//         const curProductIds = promotion.productIds.map(id => id.toString());
//         const newProductIds = productIds.filter(
//             id => !curProductIds.includes(id)
//         );

//         promotion.productIds.push(...newProductIds);
//         await promotion.save();

//         return res.status(200).json({ message: 'Add product to promotion successfully', updatedPromotion: promotion });
//     } catch (err) {
//         console.error('Add product to promotion error', err);
//         return res.status(500).json({ message: 'Error when adding product' });
//     }
// };

exports.addProductToPromotion = async (req, res) => {
    const { promotionId } = req.params;
    const { productDiscounts } = req.body;

    try {
        if (!Array.isArray(productDiscounts) || productDiscounts.length === 0)
            return res.status(400).json({ message: 'Invalid product discounts' });

        // const validProductIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        // if (validProductIds.length === 0)
        //   return res.status(400).json({ message: 'All productIds are invalid' });

        const promotion = await Promotion.findById(promotionId);
        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        const updateTasks = productDiscounts.map(async ({ productId, code }) => {
            if (!mongoose.Types.ObjectId.isValid(productId)) return;

            const promoCode = promotion.listCode.find(c => c.code === code && c.isActive);
            if (!promoCode)
                return res.status(404).json({ message: 'Promotion code not found or inactive' });

            const { discountType, discountValue } = promoCode;

            const product = await Product.findById(productId);
            if (!product) return;

            product.sale = true;
            product.promotion = promotionId;
            product.appliedCode = code;

            if (discountType === 'percentage') {
                if (discountValue < 0 || discountValue > 100)
                    return;
                product.sale_price = Math.ceil(product.price * (1 - discountValue / 100));
            } else if (discountType === 'fixed') {
                product.sale_price = Math.max(0, product.price - discountValue);
            }

            await product.save();

            const exists = promotion.productDiscounts.some(
                pd => pd.productId.toString() === productId && pd.code === code
            );

            if (!exists) {
                promotion.productDiscounts.push({ productId, code });
            }
        });

        // const existingIds = promotion.productDiscounts.map(id => id.toString());
        // const newProductIds = validProductIds.filter(id => !existingIds.includes(id));
        // promotion.productDiscounts.push(...newProductIds);

        await Promise.all(updateTasks);
        await promotion.save();

        return res.status(200).json({ message: 'Products added and promotion code applied successfully' });
    } catch (err) {
        console.error('Add product with code error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



exports.removeProductFromPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId))
            return res.status(400).json({ message: 'Invalid productId' });

        const promotion = await Promotion.findById(promotionId);
        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        const before = promotion.productDiscounts.length;
        promotion.productDiscounts = promotion.productDiscounts.filter(
            pd => pd.productId.toString() !== productId
        );

        if (promotion.productDiscounts.length === before)
            return res.status(404).json({ message: 'Product not in promotion' });

        const productAfterRemove = await Product.findById(productId);
        if (productAfterRemove) {
            productAfterRemove.sale = false;
            productAfterRemove.sale_price = productAfterRemove.price;
            productAfterRemove.appliedCode = null;
            productAfterRemove.promotion = null;
            await productAfterRemove.save();
        }

        await promotion.save();

        return res.status(200).json({ message: 'Remove product successfully', updatedPromotion: promotion });
    } catch (err) {
        console.error('Remove product from promotion', err);
        return res.status(500).json({ message: 'Error when removing product' });
    }
};

exports.togglePromotion = async (req, res) => {
    const { id } = req.params;
    try {
        const promotion = await Promotion.findById(id);
        if (!promotion)
            return res.status(404).json({ message: 'Promotion not found' });

        promotion.isActive = !promotion.isActive;
        await promotion.save();

        res.status(200).json({ message: `Promotion is now ${promotion.isActive ? 'active' : 'inactive'}`, promotion });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
};
