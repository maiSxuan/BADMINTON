const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    parent_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);