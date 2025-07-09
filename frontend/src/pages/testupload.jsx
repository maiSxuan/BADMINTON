// 1. Import đầy đủ các hook cần thiết
import React, { useState, useRef } from 'react';
import {ImagePlus} from 'lucide-react'
// ===================================================================
// COMPONENT IMAGE UPLOADER (Được định nghĩa riêng)
// ===================================================================
const ImageUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Cập nhật state để hiển thị preview ngay lập tức
    setFile(selectedFile);

    // Bắt đầu quá trình đọc và gửi file
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile); // Chuyển file thành chuỗi base64

    // Hàm được gọi khi quá trình đọc file hoàn tất
    reader.onloadend = async () => {
      try {
        const base64 = reader.result;
        
        // Gửi chuỗi base64 lên backend
        const res = await fetch("http://localhost:4000/api/products/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Upload thất bại');
        }

        const data = await res.json();
        
        // Gọi callback để báo cho component cha biết đã upload thành công
        if(onUploadSuccess) {
            onUploadSuccess(data.imageUrl);
        }
        
      } catch (error) {
        console.error("Lỗi khi upload:", error);
        alert(`Lỗi: ${error.message}`);
      }
    };
  };
  
  // Dùng ref để kích hoạt input đã bị ẩn
  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="formBox" onClick={handleClick}>
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleChange}
        ref={fileInputRef}
        style={{ display: 'none' }} // Ẩn input bằng style
      />
      <img 
        src={file ? URL.createObjectURL(file) : <ImagePlus/>} 
        alt="Upload" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};


// ===================================================================
// COMPONENT TRANG TEST
// ===================================================================
const TestUploadPage = () => {
    // State để lưu URL ảnh sau khi upload thành công
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    // Hàm callback để nhận URL từ component ImageUploader
    const handleUploadSuccess = (imageUrl) => {
        console.log("Upload thành công! URL:", imageUrl);
        setUploadedImageUrl(imageUrl);
    };

    return (
        <div style={{ padding: '50px' }}>
            <h1>Test Upload Ảnh Lên Cloudinary</h1>
            
            <p>Nhấp vào ô bên dưới để chọn và upload ảnh:</p>
            <ImageUploader onUploadSuccess={handleUploadSuccess} />

            {uploadedImageUrl && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Ảnh đã upload thành công:</h3>
                    <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '300px', border: '1px solid #ccc' }} />
                    <p>URL: {uploadedImageUrl}</p>
                </div>
            )}
        </div>
    );
};

export default TestUploadPage;