// CheckDeal.js

import React, { useState } from 'react';
// Quan trọng: Import Link để có thể điều hướng về trang chủ
import { Link } from 'react-router-dom';
import './CheckDeal.css';
import productImg from '../../assets/images/test.png';

const CheckoutBody = () => {
  // State mới để quản lý việc hiển thị
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Các state cũ vẫn giữ nguyên
  const [shippingMethod, setShippingMethod] = useState('nhanh');
  const [note, setNote] = useState('');
  const [discountCode, setDiscountCode] = useState('');

  const product = {
    name: 'Vợt cầu lông Yonex Nanoflare 700pro',
    variant: 'Phân loại hàng: 4U5',
    quantity: 1,
    price: 2800000,
  };

  // Hàm xử lý khi nhấn nút "Đặt hàng"
  const handlePlaceOrder = () => {
    // Trong ứng dụng thật, bạn sẽ gửi dữ liệu lên server ở đây
    // await api.submitOrder({ ... });

    // Sau khi xử lý thành công, cập nhật state để hiển thị thông báo
    setIsOrderPlaced(true);
  };

  // Nếu đơn hàng đã được đặt, hiển thị màn hình thành công
  if (isOrderPlaced) {
    return (
      <div className="order-success-container">
        <h2>Đơn hàng đã được xác nhận</h2>
        <p>Chúng tôi sẽ thông báo ngay khi đơn hàng được giao đi</p>
        {/* Link này sẽ điều hướng người dùng về trang chủ ("/") */}
        <Link to="/" className="back-to-home-btn">
          Trở về trang chính
        </Link>
      </div>
    );
  }

  // Nếu chưa, vẫn hiển thị form đặt hàng
  return (
    <div className="checkout-container">
      {/* Phần thông tin người nhận */}
      <div className="checkout-card address-info">
        <h3>Thiên Phú (+84) 948245245</h3>
        <p>Tòa nhà Phoenix 2, Số 37, Cao Lỗ</p>
        <p>Phường 4, Quận 8, TP. Hồ Chí Minh</p>
      </div>

      {/* Phần tóm tắt sản phẩm */}
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

      {/* Lời nhắn và Mã giảm giá gộp chung */}
      <div className="combined-input-group">
        <textarea
          className="input-field"
          placeholder="Lời nhắn cho SCD..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows="2"
        />
        <div className="input-separator"></div>
        <input
          type="text"
          className="input-field"
          placeholder="Nhập mã giảm giá"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </div>

      {/* Phương thức nhận hàng */}
      <div className="checkout-card shipping-section">
        <h3>Phương thức nhận hàng</h3>
        <div className="shipping-options">
          <div
            className={`shipping-option ${shippingMethod === 'nhanh' ? 'selected' : ''}`}
            onClick={() => setShippingMethod('nhanh')}
          >
            <span>Nhanh:</span>
            <span>Đảm bảo nhận hàng 3-5 ngày</span>
          </div>
          <div
            className={`shipping-option ${shippingMethod === 'sieu-toc' ? 'selected' : ''}`}
            onClick={() => setShippingMethod('sieu-toc')}
          >
            <span>Siêu tốc:</span>
            <span>Nhận hàng ngay ngày mai</span>
          </div>
          <div
            className={`shipping-option ${shippingMethod === 'tai-cua-hang' ? 'selected' : ''}`}
            onClick={() => setShippingMethod('tai-cua-hang')}
          >
            <span>Đến lấy tại cửa hàng</span>
          </div>
        </div>
      </div>
      
      {/* Tổng tiền và nút đặt hàng */}
      <div className="checkout-card final-summary">
        <div className="total-amount">
          <span>Tổng tiền:</span>
          <span className="total-price">2.800.000 VNĐ</span>
        </div>
        {/* Gắn hàm xử lý vào sự kiện onClick */}
        <button className="place-order-btn" onClick={handlePlaceOrder}>
          Đặt hàng
        </button>
      </div>
    </div>
  );
};

export default CheckoutBody;