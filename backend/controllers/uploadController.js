const cloudinary = require('../../config/cloudinary');
const fs = require('fs'); // Thêm thư viện 'fs' của Node.js


const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file nào được tải lên.' });
        }

        // Upload file lên Cloudinary từ đường dẫn tạm `req.file.path`
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'products' // Tên thư mục trên Cloudinary
        });
        
        // **BƯỚC QUAN TRỌNG:** Xóa file tạm trên server của bạn sau khi upload thành công
        fs.unlinkSync(req.file.path);

        res.status(200).json({ 
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Lỗi khi upload ảnh:', error);
        // Nếu có lỗi, cũng nên thử xóa file tạm nếu nó đã được tạo
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
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

        // Xử lý cả trường hợp 'ok' và 'not found'
        if (result.result === 'ok') {
            res.status(200).json({ message: 'Xóa ảnh thành công.' });
        } else {
            console.warn(`Xóa ảnh không thành công trên Cloudinary, có thể do không tìm thấy: ${public_id}`, result);
            // Vẫn trả về 200 để frontend không báo lỗi cho người dùng
            res.status(200).json({ message: 'Ảnh không tồn tại hoặc đã được xóa.' });
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