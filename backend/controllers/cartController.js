const Cart = require('../models/Cart');
const Product = require('../models/ProductModel');
const mongoose = require('mongoose');

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) 
            return res.status(200).json({ items: [], totalQuantity: 0, totalPrice: 0 });

        cart.recalculateTotals();

        const transformedItems = cart.items.map((item) => {
            const product = item.product;
            const variant = product.variants.find(v => v.variant_id.toString() === item.variant_id.toString());
            const option = variant?.options.find(o => o.sku_code === item.sku_code);

            return {
                _id: item._id,
                productId: product._id,
                name: product.name,
                thumbnail_url: product.thumbnail_url,
                variantName: variant?.name || 'Không xác định',
                optionValue: option?.value || 'Không xác định',
                sku_code: item.sku_code,
                price: item.priceAtTime,
                quantity: item.quantity,
                total: item.priceAtTime * item.quantity,
                image: variant?.images?.[0] || product.thumbnail_url || '/placeholder.svg',
                selected: true
            }
        });

        await cart.save();

        res.status(200).json({
            items: transformedItems,
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
        const { product: productId, variant_id: variantId, sku_code: optionSku, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId))
            return res.status(400).json({ message: 'Invalid productId' });

        if (quantity <= 0)
            return res.status(400).json({ message: 'Quantity must be greater than zero' });

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });

        const variant = product.variants.find(v => v.variant_id.toString() === variantId);
        if (!variant)
            return res.status(404).json({ message: 'Variant not found' });

        const option = variant.options.find(o => o.sku_code === optionSku);
        if (!option)
            return res.status(404).json({ message: 'Option not found' });

        if (option.stock_quantity < quantity)
            return res.status(400).json({ message: 'Not enough stock available' });

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
            item.sku_code === optionSku
        );

        if (existingItem)
            existingItem.quantity += quantity;
        else {
            cart.items.push({
                product: productId,
                variant_id: variantId,
                sku_code: optionSku,
                quantity,
                priceAtTime: option.price
            });
        }
        
        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Item added to cart', cart: cart.toObject() });
    } catch (err) {
        res.status(500).json({ message: 'Error adding to cart', error: err.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product: productId, variant_id: variantId, sku_code: optionSku } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) 
            return res.status(400).json({ message: 'Invalid productId or variantId' });
        

        const cart = await Cart.findOne({ user: userId });
        if (!cart) 
            return res.status(404).json({ message: 'Cart not found' });

        const prevLength = cart.items.length;

        cart.items = cart.items.filter(item => 
            !(item.product.equals(productId) &&
              item.variant_id.equals(variantId) &&
              item.sku_code === optionSku)
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
        const { product: productId, variant_id: variantId, sku_code: optionSku, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) 
            return res.status(400).json({ message: 'Invalid productId or variantId' });

        if (quantity <= 0)
            return res.status(400).json({ message: 'Quantity must be greater than zero' });

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });

        const variant = product.variants.find(v => v.variant_id.toString() === variantId);
        if (!variant)
            return res.status(404).json({ message: 'Variant not found' });

        const option = variant.options.find(o => o.sku_code === optionSku);
        if (!option)
            return res.status(404).json({ message: 'Option not found' });

        if (option.stock_quantity < quantity) 
            return res.status(400).json({ message: 'Not enough stock available' });

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => 
            item.product.equals(productId) &&
            item.variant_id.equals(variantId) &&
            item.sku_code === optionSku
        );

        if (!item) 
            return res.status(404).json({ message: 'Item not found in cart' });

        item.quantity = quantity;
        cart.recalculateTotals();
        await cart.save();

        res.status(200).json({ message: 'Cart item updated', cart});
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