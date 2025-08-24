const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema cho Tùy chọn (Option) - Không thay đổi
const OptionSchema = new Schema({
    sku_code: { type: String, required: true },
    value: { type: String, required: [true, 'Giá trị tùy chọn (ví dụ: "Size 39", "Màu Đỏ") là bắt buộc.'] },
    price: { type: Number, required: [true, 'Giá bán của tùy chọn là bắt buộc.'], min: 0 },
    stock_quantity: { type: Number, required: [true, 'Số lượng tồn kho là bắt buộc.'], default: 0 }
});

// Schema cho Phân loại (Variant) - THÊM VALIDATION
const VariantSchema = new Schema({
    // variant_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: [true, 'Tên phân loại (ví dụ: "Màu sắc", "Size") là bắt buộc.'] },
    images: [{ type: String }],
    options: {
        type: [OptionSchema],
        validate: {
            validator: function(optionsArray) {
                return Array.isArray(optionsArray) && optionsArray.length > 0;
            },
            message: 'Mỗi phân loại hàng phải có ít nhất một tùy chọn.'
        }
    }
});

// Schema cho Sản phẩm (Product) - THÊM VALIDATION
const ProductSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    thumbnail_url: { type: String },
    description: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    category_ids: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    is_published: { type: Boolean, default: false },
    price: { type: Number, required: [true, 'Giá sản phẩm là bắt buộc.'] , default: 0 },
    classification_config: [{ _id: false, name: { type: String, required: true } }],
    variants: {
        type: [VariantSchema],
        validate: {
            validator: function(variantsArray) {
                return Array.isArray(variantsArray) && variantsArray.length > 0;
            },
            message: 'Sản phẩm phải có ít nhất một phân loại hàng.'
        }
    },
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

// Ngăn chặn việc tạo lại model nếu nó đã tồn tại (hữu ích trong môi trường dev)
module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');