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
                slug: product.slug,
                image: variant?.images?.[0] || product.thumbnail_url || '/placeholder.svg',
                quantity: item.quantity,
                price: item.priceAtTime,
                sku_code: item.sku_code,
                color: variant?.name || 'Không xác định',
                size: option?.value || 'Không xác định',
            };
        });

        if (hasChanged) {
            cart.recalculateTotals();
            await cart.save();
        }

        res.status(200).json({
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

        const quantityToAdd = parseInt(quantity, 10);
        if (!mongoose.Types.ObjectId.isValid(productId) || 
            !mongoose.Types.ObjectId.isValid(variantId) || 
            !mongoose.Types.ObjectId.isValid(optionId)) {
            return res.status(400).json({ message: 'ID sản phẩm, biến thể hoặc tùy chọn không hợp lệ.' });
        }
        
        if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
            return res.status(400).json({ message: 'Số lượng thêm vào phải lớn hơn 0.' });
        }

        const product = await Product.findById(productId);
        if (!product || !product.is_published) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc đã bị ẩn.' });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: 'Phân loại (màu sắc,...) không tồn tại.' });
        }

        const option = variant.options.id(optionId);
        if (!option) {
            return res.status(404).json({ message: 'Tùy chọn (size,...) không tồn tại.' });
        }
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }
        const existingItem = cart.items.find(item =>
            item.product.equals(productId) &&
            item.variant_id.equals(variantId) &&
            item.option_id.equals(optionId)
        );

        const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
        const newTotalQuantity = currentQuantityInCart + quantityToAdd;
        if (newTotalQuantity > option.stock_quantity) {
            const addableQuantity = option.stock_quantity - currentQuantityInCart;
            let errorMessage = `Số lượng sản phẩm vượt quá tồn kho (Tồn kho: ${option.stock_quantity}).`;
            if (addableQuantity > 0) {
                errorMessage = `Trong giỏ đã có ${currentQuantityInCart} sản phẩm. Bạn chỉ có thể thêm tối đa ${addableQuantity} sản phẩm nữa.`;
            } else {
                errorMessage = `Số lượng sản phẩm trong giỏ đã đạt mức tối đa theo tồn kho.`;
            }
            return res.status(400).json({ message: errorMessage });
        }
        const now = new Date();
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean();

        let priceAtTime = option.price || product.price; 
        let appliedPromoCode = null;
        activePromotions.forEach(promo => {
            const prodDiscount = promo.productDiscounts?.find(pd => pd.productId.toString() === productId);
            if (prodDiscount) {
                const codeEntry = promo.listCode?.find(code => code.code === prodDiscount.code && code.isActive);
                if (codeEntry) {
                    let newPrice;
                    if (codeEntry.discountType === 'percentage') {
                        newPrice = priceAtTime * (1 - codeEntry.discountValue / 100);
                    } else { // 'fixed'
                        newPrice = Math.max(priceAtTime - codeEntry.discountValue, 0);
                    }
                    if (newPrice < priceAtTime) {
                        priceAtTime = Math.round(newPrice);
                        appliedPromoCode = codeEntry.code;
                    }
                }
            }
        });
        if (existingItem) {
            existingItem.quantity = newTotalQuantity;
            existingItem.priceAtTime = priceAtTime;
            existingItem.appliedCode = appliedPromoCode; 
        } else {
            cart.items.push({
                product: new mongoose.Types.ObjectId(productId),
                variant_id: new mongoose.Types.ObjectId(variantId),
                option_id: new mongoose.Types.ObjectId(optionId),
                sku_code: option.sku_code,
                quantity: quantityToAdd,
                priceAtTime: priceAtTime,
                appliedCode: appliedPromoCode
            });
        }
        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Thêm sản phẩm vào giỏ hàng thành công.', cart });

    } catch (err) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.', error: err.message });
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
        const { product: productId, variant_id: variantId, option_id: optionId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId))
            return res.status(400).json({ message: 'ID sản phẩm hoặc biến thể không hợp lệ' });

        const newQuantity = parseInt(quantity, 10);
        if (isNaN(newQuantity) || newQuantity <= 0) {
            return res.status(400).json({ message: 'Số lượng phải là một số lớn hơn 0' });
        }

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        const variant = product.variants.id(variantId);
        if (!variant)
            return res.status(404).json({ message: 'Không tìm thấy biến thể' });

        const option = variant.options.id(optionId);
        if (!option)
            return res.status(404).json({ message: 'Không tìm thấy tùy chọn' });

        const cart = await Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

        const item = cart.items.find(item =>
            item.product.equals(productId) &&
            item.variant_id.equals(variantId) &&
            item.option_id.equals(optionId)
        );
        if (!item)
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        if (newQuantity > option.stock_quantity)
            return res.status(400).json({ message: `Số lượng vượt quá tồn kho. Tối đa: ${option.stock_quantity}` });
        item.quantity = newQuantity;
        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Cập nhật giỏ hàng thành công', cart });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error: err.message });
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