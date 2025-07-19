const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    productVariant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
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
}, {
    timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);