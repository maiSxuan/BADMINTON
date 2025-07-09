const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    _id: {type:String},
    name: { type: String, required: [true, 'Tên sản phẩm là bắt buộc'] },
    description: { type: String, required: [true, 'Mô tả sản phẩm là bắt buộc'] },
    category: {
        type: String,
        ref: 'Category',
        required: [true, 'Ngành hàng là bắt buộc']
    },
    main_image: { type: String, required: [true, 'Ảnh bìa là bắt buộc'] }, // Ảnh bìa
}, {
    _id: false,
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);