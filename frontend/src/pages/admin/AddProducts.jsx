import React, { useState } from 'react';
import VideoUploader from '../../components/common/VideoUploader';
import ImageUploader from '../../components/common/ImageUploader';
import './AddProducts.css';
import ProductClassification from "./ProductClassification"


const AddProducts = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const applyToAll = () => {
  // TODO: xử lý logic áp dụng toàn bộ phân loại
    alert("Đã áp dụng cho tất cả các phân loại hàng!");
  };
  return (
    <div className="add-product-form">
      {/* Tab Navigation */}
      <div className="tab-wrapper">
        <div className="tab-container">
          <button
            onClick={() => setActiveTab("basic")}
            className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
          >
            Thông tin cơ bản
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`tab-button ${activeTab === "sales" ? "active" : ""}`}
          >
            Thông tin bán hàng
          </button>
        </div>
      </div>

      {/* Nội dung theo tab */}
      {activeTab === "basic" && (
        <>
          {/* Hình ảnh sản phẩm */}
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

          {/* Ảnh bìa */}
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

          {/* Video sản phẩm */}
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

          {/* Tên sản phẩm */}
          <div className="form-row">
            <label className="form-label" htmlFor="product-name">Tên sản phẩm</label>
            <div className="form-control">
              <input type="text" id="product-name" className="form-input" />
            </div>
          </div>

          {/* Ngành hàng */}
          <div className="form-row">
            <label className="form-label" htmlFor="product-category">Ngành hàng</label>
            <div className="form-control">
              <input type="text" id="product-category" className="form-input" />
            </div>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="form-row">
            <label className="form-label" htmlFor="product-description">Mô tả sản phẩm</label>
            <div className="form-control">
              <textarea id="product-description" className="form-textarea" rows="5"></textarea>
            </div>
          </div>
        </>
      )}

      {activeTab === "sales" && (
        <div className="sales-tab-wrapper">
          <ProductClassification />
        </div>
      )}


    </div>
  );
};

export default AddProducts;
