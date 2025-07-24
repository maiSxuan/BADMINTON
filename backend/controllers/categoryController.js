const Category = require('../models/CategoryModel');
const slugify = require('slugify');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Tên ngành hàng là bắt buộc' });
    }

    try {
        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
        
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(409).json({ message: 'Ngành hàng với tên này đã tồn tại.' });
        }

        const newCategory = new Category({
            name,
            slug
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory); 

    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
exports.searchBrands = async (req, res) => {
    try {
        const query = req.query.q || '';
        const brands = await Brand.find({ name: { $regex: query, $options: 'i' } }).limit(10);
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi tìm kiếm thương hiệu", error: error.message });
    }
};