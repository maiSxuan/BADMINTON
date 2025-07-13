const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductConfigurationSchema = new Schema({
  product_item_id: { type: String, ref: 'ProductItem', required: true },
  variation_option_id: { type: String, ref: 'VariationOption', required: true }
});

ProductConfigurationSchema.index(
  { product_item_id: 1, variation_option_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('ProductConfiguration', ProductConfigurationSchema);