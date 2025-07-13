const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    category_id: {type:String, required: true},
    name: { type: String, required: true, unique: true },
}
);

module.exports = mongoose.model('Category', CategorySchema);