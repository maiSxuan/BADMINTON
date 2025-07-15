const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VariationSchema = new Schema ({
    variation_id:{type: String, required:true},
    category_id: {
        type: String,
        ref: 'Category',
        required: true
    },
    name: {type: String, required: true}
}
);
VariationSchema.index({ variation_id: 1, category_id: 1 }, { unique: true });
module.exports = mongoose.model('Variation', VariationSchema);