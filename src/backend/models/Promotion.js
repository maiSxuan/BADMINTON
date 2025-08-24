const mongoose = require('mongoose');

const PromotionCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },

  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },

  discountValue: {
    type: Number,
    required: true,
    min: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },
}, { _id: false });

const PromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  listCode: {
    type: [PromotionCodeSchema],
    default: []
  },

  productDiscounts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      require: true
    },
    code: {
      type: String,
      require: true
    }
  }, { _id: false }],

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Promotion', PromotionSchema);