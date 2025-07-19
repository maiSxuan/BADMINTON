const { default: mongoose } = require('mongoose');
const Cart = require('../models/Cart');
// const ProductVariant = require('../models/ProductVariant');
// require('../models/ProductVariant');

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate('items.productVariant');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productVariantId, quantity } = req.body;

        if (!productVariantId || !Number.isInteger(quantity) || quantity <= 0)
            return res.status(400).json({ message: 'Invalid input' });

        // const variant = await ProductVariant.findById(productVariantId);
        // if (!variant)
        //     return res.status(404).json({ message: 'Variant not found' });

        // if (variant.stock < quantity)
        //     return res.status(400).json({ message: 'Insufficient stock' });

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(item => 
            item.productVariant.toString() === productVariantId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productVariant: productVariantId, quantity });
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart', cart });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add to cart', error: err.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productVariantId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productVariantId))
            return res.status(400).json({ message: 'Invalid productVariantId format' });

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const initLength = cart.items.length;
        cart.items = cart.items.filter(item => 
            item.productVariant.toString() !== productVariantId
        );

        if (cart.items.length === initLength) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        if (cart.items.length === 0) {
            // console.log('Cart is empty, deleting...');
            await Cart.deleteOne({ id: cart.id });
            return res.status(200).json({ message: 'Cart is now empty and has been deleted' });
        }


        // const itemIndex = cart.items.findIndex(item =>
        //     item.productVariant.toString() === productVariantId
        // );
        // if (itemIndex === -1) {
        //     return res.status(404).json({ message: 'Product not found in cart' });
        // }
        // cart.items.splice(itemIndex, 1); // remove by index

        await cart.save();

        res.status(200).json({ message: 'Item removed from cart', cart });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove item', error: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productVariantId, quantity } = req.body;

        if (!productVariantId || !Number.isInteger(quantity) || quantity <= 0)
            return res.status(400).json({ message: 'Invalid input' });

        if (!mongoose.Types.ObjectId.isValid(productVariantId))
            return res.status(400).json({ message: 'Invalid productVariantId format' });
        
        // const variant = await ProductVariant.findById(productVariantId);
        // if (!variant)
        //     return res.status(404).json({ message: 'Variant not found' });
        
        // if (variant.stock < quantity)
        //     return res.status(400).json({ message: 'Insufficient stock' });

        // if (quantity <= 0) {
        //     return res.status(400).json({ message: 'Quantity must be greater than 0' });
        // }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => 
            item.productVariant.toString() === productVariantId
        );

        if (!item) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        item.quantity = quantity;
        await cart.save();

        res.status(200).json({ message: 'Item updated successfully', cart });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to update item', error: err.message });
    }
};