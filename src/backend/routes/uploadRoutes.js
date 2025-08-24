const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

// Cấu hình Multer để lưu file tạm vào thư mục 'uploads/'
// Đảm bảo bạn đã tạo thư mục này ở thư mục gốc của backend
const upload = multer({ dest: 'uploads/' });

// Route để upload một ảnh
// `upload.single('image')` là middleware xử lý file có field name là 'image'
router.post('/image', upload.single('image'), uploadImage);

// Route để xóa một ảnh
router.delete('/image', deleteImage);

module.exports = router;