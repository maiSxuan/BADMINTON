// import React from 'react';
// import VideoUploader from '../../components/common/VideoUploader';
// import ImageUploader from '../../components/common/ImageUploader';
// const AddProducts = () => {
//   return (
//     <div>
//         <div className="Thumbnail">
//           <p>Hình ảnh sản phẩm</p>
//           <ImageUploader />
//           <ul>
//             <li>Tỉ lệ ảnh 1:1</li>
//             <li>Hình ảnh đại diện hiển thị trên cửa hàng</li>
//           </ul>
//         </div>
//         <div className="Product-Images">
//           <ImageUploader />
//         </div>
//         <div>
//           <VideoUploader/>
//         </div>
//     </div>
//   );
// };

// export default AddProducts;

import React from 'react';
import VideoUploader from '../../components/common/VideoUploader';
import ImageUploader from '../../components/common/ImageUploader';
import './AddProducts.css'; // Tạo và import file CSS cho trang này

const AddProducts = () => {
  

  return (
    // Div cha cho toàn bộ form
    <div className="add-product-form">
      {/* Hàng 1: Hình ảnh sản phẩm */}
      <div className="form-row">
        <label className="form-label">Hình ảnh sản phẩm</label>
        <div className="form-control">
          <ImageUploader />
          <div className="form-description">
            <p>Tỉ lệ ảnh 1:1</p>
            <p>Tối đa 10 ảnh</p>
          </div>
        </div>
      </div>

      {/* Hàng 2: Ảnh bìa */}
      <div className="form-row">
        <label className="form-label">Ảnh bìa</label>
        <div className="form-control">
          <ImageUploader />
          <div className="form-description">
            <p>Tỉ lệ ảnh 1:1</p>
            <p>Hình ảnh đại diện hiển thị trên cửa hàng</p>
          </div>
        </div>
      </div>

      {/* Hàng 3: Video sản phẩm */}
      <div className="form-row">
        <label className="form-label">Video sản phẩm</label>
        <div className="form-control">
          <VideoUploader />
          <div className="form-description">
            <p>Kích thước tối đa 20MB</p>
            <p>Thời lượng: 10 - 60s</p>
            <p>Định dạng: mp4</p>
          </div>
        </div>
      </div>
      
      {/* Các hàng input khác */}
      <div className="form-row">
        <label className="form-label" htmlFor="product-name">Tên sản phẩm</label>
        <div className="form-control">
          <input type="text" id="product-name" className="form-input" />
        </div>
      </div>
      <div className="form-row">
        <label className="form-label" htmlFor="product-category">Ngành hàng</label>
        <div className="form-control">
          <input type="text" id="product-category" className="form-input" />
        </div>
      </div>
      <div className="form-row">
        <label className="form-label" htmlFor="product-description">Mô tả sản phẩm</label>
        <div className="form-control">
          <textarea id="product-description" className="form-textarea" rows="5"></textarea>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;

