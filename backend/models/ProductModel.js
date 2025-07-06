const mongoose = require ('mongoose')
const productSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, unique: true},
        imagesURL: {type: [String], required: false},
        thumbnailURL: {type:String,required: false},
        videoURL: {type:String, required:false},
        type: {type: String, required: true},
        brand: {type:String, required: true},
        price: {type: Number, required: true},
        countInStock: {type: Number, required: true},
        rating: {type: Number, required: false},
        description: {type: String, required: true},
    },
    {
        timestamps: true,
    }
);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;