const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

const upload = multer({ dest: 'uploads/' });

router.post('/image', upload.single('image'), uploadImage);
router.delete('/image', deleteImage);

module.exports = router;