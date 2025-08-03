const mongoose = require('mongoose');
const { Schema } = mongoose;

const OptionSchema = new Schema({
    // option_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    sku_code: { type: String, required: true },
    value: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock_quantity: { type: Number, required: true, default: 0 }
});

const VariantSchema = new Schema({
    // variant_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
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
    variants: [VariantSchema],

    // xử lí giảm giá sản phẩm 
    sale: { type: Boolean, default: false },
    sale_price: { type: Number, default: 0 },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        default: null,
    },
    appliedCode: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Thêm tên collection
module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');