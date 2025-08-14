const { Cart } = require('../models/Cart');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const mongoose = require('mongoose');

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId })
            .populate('items.product')
            .populate('items.option_id');

        if (!cart)
            return res.status(200).json({ items: [], totalQuantity: 0, totalPrice: 0 });

        // cart.recalculateTotals();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: todayStart }
        }).lean();

        let hasChanged = false;

        // const transformedItems = cart.items.map((item) => {
        //     const product = item.product;
        //     const variant = product.variants.id(item.variant_id);
        //     const option = variant.options.id(item.option_id);
        //     return {
        //         _id: item._id,
        //         productId: product._id,
        //         variantId: item.variant_id,
        //         optionId: item.option_id,
        //         name: product.name,
        //         image: variant?.images?.[0] || product.thumbnail_url || '/placeholder.svg',
        //         quantity: item.quantity,
        //         price: item.priceAtTime,
        //         sku_code: item.sku_code,
        //         color: variant?.name || 'Không xác định',
        //         size: option?.value || 'Không xác định',
        //     };
        // });
        const updatedItems = cart.items.map(item => {
            const product = item.product;
            const variant = product.variants.id(item.variant_id);
            const option = variant.options.id(item.option_id);

            let basePrice = option.price || product.price;
            let discountPrice = basePrice;
            let appliedPromoCode = null;

            activePromotions.forEach(promo => {
                const matched = promo.productDiscounts?.find(pd => pd.productId.toString() === product._id.toString());
                if (matched) {
                    const codeData = promo.listCode.find(c => c.code === matched.code && c.isActive);
                    if (codeData) {
                        if (codeData.discountType === 'percentage') {
                            discountPrice = discountPrice * (1 - codeData.discountValue / 100);
                        } else if (codeData.discountType === 'fixed') {
                            discountPrice = Math.max(discountPrice - codeData.discountValue, 0);
                        }
                        appliedPromoCode = matched.code;
                    }
                }
            });

            discountPrice = Math.round(discountPrice);

            // Nếu giá trong cart khác với giá giảm hiện tại thì cập nhật
            if (item.priceAtTime !== discountPrice) {
                item.priceAtTime = discountPrice;
                item.appliedCode = appliedPromoCode;
                hasChanged = true;
            }

            return {
                _id: item._id,
                productId: product._id,
                variantId: item.variant_id,
                optionId: item.option_id,
                name: product.name,
                image: variant?.images?.[0] || product.thumbnail_url || '/placeholder.svg',
                quantity: item.quantity,
                price: item.priceAtTime,
                sku_code: item.sku_code,
                color: variant?.name || 'Không xác định',
                size: option?.value || 'Không xác định',
            };
        });

        // await cart.save();
        if (hasChanged) {
            cart.recalculateTotals();
            await cart.save();
        }

        res.status(200).json({
            // items: transformedItems,
            // totalQuantity: cart.totalQuantity,
            // totalPrice: cart.totalPrice
            items: updatedItems,
            totalQuantity: cart.totalQuantity,
            totalPrice: cart.totalPrice
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cart', error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product: productId, variant_id: variantId, option_id: optionId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId))
            return res.status(400).json({ message: 'Invalid productId or variantId' });

        if (quantity <= 0)
            return res.status(400).json({ message: 'Quantity must be greater than zero' });

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });

        const variant = product.variants.id(variantId);
        if (!variant)
            return res.status(404).json({ message: 'Variant not found' });

        const option = variant.options.id(optionId);
        if (!option)
            return res.status(404).json({ message: 'Option not found' });

        if (option.stock_quantity < quantity)
            return res.status(400).json({ message: 'Not enough stock available' });

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: todayStart }
        }).lean();

        let discountPrice = option.price || product.price;
        let appliedPromoCode = null;

        activePromotions.forEach(promo => {
            const prodDiscount = promo.productDiscounts?.find(pd => pd.productId.toString() === productId);
            if (prodDiscount) {
                const codeEntry = promo.listCode?.find(code => code.code === prodDiscount.code && code.isActive);
                if (codeEntry) {
                    let newPrice;
                    if (codeEntry.discountType === 'percentage') {
                        newPrice = discountPrice * (1 - codeEntry.discountValue / 100);
                    } else if (codeEntry.discountType === 'fixed') {
                        newPrice = Math.max(discountPrice - codeEntry.discountValue, 0);
                    }
                    if (newPrice < discountPrice) {
                        discountPrice = newPrice;
                        appliedPromoCode = codeEntry.code;
                    }
                }
            }
        });
        discountPrice = Math.round(discountPrice);

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        const existingItem = cart.items.find(item =>
            item.product.equals(productId) &&
            item.variant_id.equals(variantId) &&
            item.option_id.equals(optionId)
        );

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.priceAtTime = discountPrice;
            existingItem.appliedCode = appliedPromoCode;
        } else {
            cart.items.push({
                product: new mongoose.Types.ObjectId(productId),
                variant_id: new mongoose.Types.ObjectId(variantId),
                option_id: new mongoose.Types.ObjectId(optionId),
                sku_code: option.sku_code,
                quantity,
                priceAtTime: discountPrice,
                appliedCode: appliedPromoCode
            });
        }

        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Item added to cart', cart: cart.toObject() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding to cart', error: err.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product: productId, variant_id: variantId, option_id: optionId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId))
            return res.status(400).json({ message: 'Invalid productId or variantId' });

        const cart = await Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });

        const prevLength = cart.items.length;

        cart.items = cart.items.filter(item =>
            !(item.product.equals(productId) &&
                item.variant_id.equals(variantId) &&
                item.option_id.equals(optionId))
        );

        if (cart.items.length === prevLength)
            return res.status(404).json({ message: 'Item not found in cart' });


        cart.recalculateTotals();
        await cart.save();

        return res.status(200).json({ message: 'Cart item removed', cart });
    } catch (err) {
        return res.status(500).json({ message: 'Error removing cart item', error: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product: productId, variant_id: variantId, option_id: optionId, delta, priceAtTime } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId))
            return res.status(400).json({ message: 'Invalid productId or variantId' });

        if (delta !== 1 && delta !== -1)
            return res.status(400).json({ message: 'Delta must be either 1 or -1' });

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });

        const variant = product.variants.id(variantId);
        if (!variant)
            return res.status(404).json({ message: 'Variant not found' });

        const option = variant.options.id(optionId);
        if (!option)
            return res.status(404).json({ message: 'Option not found' });

        const cart = await Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item =>
            item.product.equals(productId) &&
            item.variant_id.equals(variantId) &&
            item.option_id.equals(optionId)
        );

        if (!item)
            return res.status(404).json({ message: 'Item not found in cart' });

        const newQuantity = item.quantity + delta;

        if (newQuantity <= 0)
            return res.status(400).json({ message: 'Quantity must be greater than 0' });

        if (newQuantity > option.stock_quantity)
            return res.status(400).json({ message: 'Not enough stock available' });

        item.quantity = newQuantity;

        if (priceAtTime !== undefined) {
            item.priceAtTime = priceAtTime;
        }

        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Cart item updated', cart });
    } catch (err) {
        res.status(500).json({ message: 'Error updating cart item', error: err.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });

        if (cart.items.length === 0)
            return res.status(200).json({ message: 'Cart already empty', cart });

        cart.items = [];
        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Cart cleared', cart });
    } catch (err) {
        res.status(500).json({ message: 'Error clearing cart', error: err.message });
    }
};

exports.removeSelectedItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0)
            return res.status(400).json({ message: 'No items provided for deletion' });

        const cart = await Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });

        const prevLength = cart.items.length;

        cart.items = cart.items.filter(cartItem => {
            // return !items.some(selectedItem => 
            //     cartItem.product.equals(selectedItem.product) &&
            //     cartItem.variant_id.equals(selectedItem.variant_id) &&
            //     cartItem.option_id.equals(selectedItem.option_id)
            // );
            return !items.some(selectedItem =>
                cartItem.product.toString() === selectedItem.product &&
                cartItem.variant_id.toString() === selectedItem.variant_id &&
                cartItem.option_id.toString() === selectedItem.option_id
            );
        });

        if (cart.items.length === prevLength)
            return res.status(404).json({ message: 'No matching items found in cart' });

        cart.recalculateTotals();
        await cart.save();

        return res.status(200).json({ message: 'Selected items removed from cart', cart });
    } catch (err) {
        return res.status(500).json({ message: 'Error removing selected items', err });
    }
};