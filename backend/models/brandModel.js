const mongoose = require('mongoose');
const { Schema } = mongoose;

const BrandSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);