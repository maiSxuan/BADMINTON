const Brand = require('../models/Brand');
const slugify = require('slugify');

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({}).sort({ name: 1 });
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy danh sách thương hiệu", error: error.message });
    }
};

exports.createBrand = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Tên thương hiệu là bắt buộc' });
    }

    try {
        const slug = slugify(name, { lower: true, strict: true });
        
        const existingBrand = await Brand.findOne({ slug });
        if (existingBrand) {
            return res.status(409).json({ message: 'Thương hiệu đã tồn tại.' });
        }

        const newBrand = new Brand({ name, slug });
        await newBrand.save();
        res.status(201).json(newBrand);

    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi tạo thương hiệu", error: error.message });
    }
};