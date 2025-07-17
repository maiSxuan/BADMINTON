const mongoose = require('mongoose');
const { Schema } = mongoose;

const OptionSchema = new Schema({
    sku_code: { type: String, required: true, unique: true },
    size: { type: String, required: true },
    stock_quantity: { type: Number, required: true, default: 0 }
}, { _id: false }); 

const VariantSchema = new Schema({
    variant_id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true }, 
    price: { type: Number, required: true },
    list_price: { type: Number },
    thumbnail_url: { type: String },
    images: [{ type: String }],
    options: [OptionSchema] 
});

const ProductSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    brand: { type: String },
    category_ids: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    is_published: { type: Boolean, default: true },
    variants: [VariantSchema] 
}, {
    timestamps: true 
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;