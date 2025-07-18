import React, { useState } from 'react';
import './Uploader.css';
import addImageIcon from '../../assets/icons/addimage.svg';

const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:4000/api/upload/image', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload ảnh thất bại.');
    }

    return await response.json();
};

const deleteImageFromServer = async (public_id) => {
    const response = await fetch('http://localhost:4000/api/upload/image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Xóa ảnh thất bại.');
    }

    return await response.json();
};

const ImageUploader = ({ onUploadSuccess, onImageRemove, initialImage = null }) => {
    const [imageInfo, setImageInfo] = useState({ url: initialImage, public_id: null });
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setError('');
            setIsUploading(true);
            try {
                const newImageInfo = await uploadImageToServer(selectedFile);
                setImageInfo(newImageInfo);
                if (onUploadSuccess) {
                    onUploadSuccess(newImageInfo);
                }
            } catch (err) {
                setError(err.message || 'Tải lên thất bại!');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemove = async () => {
        if (!imageInfo.public_id) {
            setImageInfo({ url: null, public_id: null });
            if (onImageRemove) onImageRemove(null);
            return;
        }

        try {
            await deleteImageFromServer(imageInfo.public_id);
            if (onImageRemove) {
                onImageRemove(imageInfo.public_id);
            }
            setImageInfo({ url: null, public_id: null });
        } catch (err) {
            alert(err.message);
        }
    };

    const renderContent = () => {
        if (isUploading) {
            return <div className="uploader-status">Đang tải...</div>;
        }
        if (imageInfo.url) {
            return (
                <div className="image-preview-container">
                    <img src={imageInfo.url} alt="Preview" className="image-preview" />
                    <button type="button" className="remove-image-btn" onClick={handleRemove}>×</button>
                </div>
            );
        }
        return (
            <label className="uploader-box">
                <input type="file" onChange={handleFileChange} hidden disabled={isUploading} />
                <img src={addImageIcon} alt="Thêm ảnh" className="placeholder-icon" />
            </label>
        );
    };

    return (
        <div className="uploader-wrapper">
            {renderContent()}
            {error && <p className="uploader-error">{error}</p>}
        </div>
    );
};

export default ImageUploader;