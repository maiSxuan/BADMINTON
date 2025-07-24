const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    sku_code: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    priceAtTime: {
        type: Number,
        required: true,
    },
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    totalQuantity: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

cartSchema.methods.recalculateTotals = function () {
    this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + item.quantity * item.priceAtTime, 0);
};

module.exports = mongoose.model('Cart', cartSchema);