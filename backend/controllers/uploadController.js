const cloudinary = require('../../config/cloudinary');

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file nào được tải lên.' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'products'
        });
        
        res.status(200).json({ 
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Lỗi khi upload ảnh:', error);
        res.status(500).json({ message: 'Upload ảnh thất bại', error: error.message });
    }
};

const deleteImage = async (req, res) => {
    const { public_id } = req.body;

    if (!public_id) {
        return res.status(400).json({ message: 'Public ID là bắt buộc.' });
    }

    try {
        const result = await cloudinary.uploader.destroy(public_id);

        if (result.result === 'ok') {
            res.status(200).json({ message: 'Xóa ảnh thành công.' });
        } else {
            res.status(500).json({ message: 'Xóa ảnh trên Cloudinary thất bại.', details: result });
        }

    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa ảnh', error: error.message });
    }
};

module.exports = {
    uploadImage,
    deleteImage
};