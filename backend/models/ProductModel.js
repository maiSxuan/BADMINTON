const mongoose = require('mongoose');
const { Schema } = mongoose;

const OptionSchema = new Schema({
    sku_code: { type: String, required: true },
    value: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock_quantity: { type: Number, required: true, default: 0 }
}, { _id: false });

const VariantSchema = new Schema({
    variant_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    images: [{ type: String }],
    options: [OptionSchema]
});

const ProductSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    thumbnail_url: { type: String },
    description: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    category_ids: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    is_published: { type: Boolean, default: false },
    price: { type: Number, required: true, default: 0 },
    classification_config: [{ _id: false, name: { type: String, required: true } }],
    variants: [VariantSchema]
}, { timestamps: true });

// Thêm tên collection
module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');