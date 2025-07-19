const mongoose = require('mongoose')

const productVariantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    color: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    sale: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    image: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductVariant', productVariantSchema);