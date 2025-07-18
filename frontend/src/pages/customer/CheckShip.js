// OrderTrackingPage.jsx

import React, { useState } from 'react';
import './CheckShip.css';
import { Truck } from 'lucide-react'; // Gợi ý: Dùng thư viện icon như lucide-react
import productImg from '../../assets/images/test.png'; // Sử dụng lại đường dẫn ảnh của bạn

const OrderTrackingPage = () => {
  const orderId = 'SE001';
  const [copyButtonText, setCopyButtonText] = useState('Sao chép');

  const product = {
    name: 'Vợt cầu lông Yonex Nanoflare 700pro',
    variant: 'Phân loại hàng: 4U5',
    quantity: 1,
    price: 2800000,
  };

  // Hàm xử lý sao chép mã đơn hàng
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopyButtonText('Đã sao chép!');
      setTimeout(() => {
        setCopyButtonText('Sao chép');
      }, 2000); // Reset text sau 2 giây
    });
  };

  return (
    <div className="tracking-page-container">
      {/* Khối thông tin giao hàng */}
      <div className="delivery-status-card">
        <h3>
          Thời gian đảm bảo nhận hàng: <strong>9 Th07 - 10 Th07</strong>
        </h3>
        <p className="status-subtitle">
          Đơn hàng đã xác nhận và chờ chuyển sang đơn vị vận chuyển
        </p>

        <div className="shipping-info-box">
          <h4>Thông tin vận chuyển :</h4>
          <div className="shipping-method">
            <Truck size={20} />
            <span>Chuyển phát nhanh</span>
          </div>
        </div>

        <div className="address-info-box">
          <h4>Thông tin nhận hàng :</h4>
          <div className="address-content">
            <div className="address-details">
              <strong>Thiên Phú</strong> (+84) 948245245
              <p>Tòa nhà Phoenix 2, Số 37, Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh</p>
            </div>
            <button className="update-btn">Cập nhật</button>
          </div>
        </div>
      </div>

      {/* Mã đơn hàng */}
      <div className="order-id-section">
        <span>Mã đơn hàng: <strong>{orderId}</strong></span>
        <button
          className={`copy-btn ${copyButtonText === 'Đã sao chép!' ? 'copied' : ''}`}
          onClick={handleCopyOrderId}
        >
          {copyButtonText}
        </button>
      </div>

      {/* Tóm tắt sản phẩm (tái sử dụng từ trang trước) */}
      <div className="product-summary">
        <div className="product-image-container">
          <img src={productImg} alt={product.name} className="product-image" />
        </div>
        <div className="product-details">
          <p className="product-name">{product.name}</p>
          <p className="product-variant">{product.variant}</p>
          <p className="product-quantity">x{product.quantity}</p>
        </div>
        <span className="product-price">
          {product.price.toLocaleString('vi-VN')}đ
        </span>
      </div>

      {/* Tổng tiền */}
      <div className="total-section">
        <span>Tổng tiền:</span>
        <span className="total-price-value">2.800.000 VNĐ</span>
      </div>

      {/* Các nút hành động */}
      <div className="action-buttons">
        <button className="action-btn cancel-btn">Hủy đơn hàng</button>
        <button className="action-btn review-btn">Đánh giá đơn hàng</button>
      </div>
    </div>
  );
};

export default OrderTrackingPage;