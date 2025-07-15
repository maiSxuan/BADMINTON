const mongoose = require('mongoose')

const variationOptionSchema = new mongoose.Schema({
    variation_option_id: {type: String, required: true},
    variation_id: {type: String,ref:'Variation', required: true},
    value: {type:String, required: true}
}
)
variationOptionSchema.index({variation_option_id: 1, variation_id: 1 }, { unique: true });
module.exports = mongoose.model('VariationOption', variationOptionSchema)