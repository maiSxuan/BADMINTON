"use client";

import React from "react";
import "./OrderDetail.css";

const OrderDetail = ({ order, onBack }) => {
  if (!order) return null;

  return (
    <div className="order-detail-overlay">
      <div className="order-detail-container">
        {/* Header */}
        <div className="order-detail-header">
          <button className="back-button" onClick={onBack}>
            ← Quay lại đơn hàng
          </button>
          <div className="order-header-info">
            <h1 className="order-id-large">{order.id}</h1>
            <span className="order-status-header">● {order.status}</span>
          </div>
        </div>

        {/* Order Information */}
        <div className="order-info-section">
          <h2>Thông tin đơn hàng</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Vị trí</span>
              <span className="info-value">Việt Nam</span>
            </div>
            <div className="info-item">
              <span className="info-label">Thời gian đã tạo</span>
              <span className="info-value">{order.date}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tùy chọn giao hàng</span>
              <span className="info-value">Giao hàng tiêu chuẩn</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tên kho hàng</span>
              <span className="info-value">Quận 10, TP HCM</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID kho hàng</span>
              <span className="info-value">KH122</span>
            </div>
            <div className="info-item">
              <span className="info-label">Lấy hàng xong</span>
              <span className="info-value">10/06/2025 09:15:45</span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">Giao cho hãng vận chuyển</span>
              <span className="info-value">12/06/2025 11:23:40</span>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="product-info-section">
          <h3>Thông tin sản phẩm</h3>
          <div className="product-detail">
            <div className="product-image-large"></div>
            <div className="product-details">
              <h4>{order.product}</h4>
              <p>Số lượng: {order.quantity}</p>
              <p className="product-price">{order.total}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="customer-info-section">
          <h3>Thông tin khách hàng</h3>
          <div className="customer-placeholder">
            <p>Thông tin khách hàng sẽ được hiển thị ở đây</p>
          </div>
        </div>

        {/* Seller Notes */}
        <div className="seller-notes-section">
          <h3>Lưu ý cho người bán</h3>
          <div className="notes-placeholder">
            <p>Ghi chú từ người bán sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateOrderModal = ({ visible, order, onClose, onSave }) => {
  const [orderStatus, setOrderStatus] = React.useState("");
  const [shippingProvider, setShippingProvider] = React.useState("");

  const handleSave = () => {
    onSave({
      id: order.id,
      status: orderStatus,
      delivery: shippingProvider,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Cập nhật trạng thái giao hàng</h3>

        <div className="section">
          <label>Trạng thái đơn hàng</label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option>Chờ lấy hàng</option>
            <option>Đã lấy hàng</option>
            <option>Đang vận chuyển</option>
            <option>Đang giao</option>
            <option>Giao thành công</option>
            <option>Giao không thành công</option>
          </select>
        </div>

        <div className="section">
          <label>Chọn tên đơn vị giao hàng</label>
          <select
            value={shippingProvider}
            onChange={(e) => setShippingProvider(e.target.value)}
          >
            <option value="">-- Chọn đơn vị --</option>
            <option>Giao hàng tiêu chuẩn - J&T Express</option>
            <option>Giao hàng tiết kiệm - VN Post</option>
            <option>Giao hàng siêu tốc - Ahamove</option>
          </select>
        </div>

        <div className="modal-buttons">
          <button className="save-btn" onClick={handleSave}>
            Lưu
          </button>
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export { OrderDetail, UpdateOrderModal };
