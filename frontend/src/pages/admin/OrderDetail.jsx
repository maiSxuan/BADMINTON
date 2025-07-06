"use client"

import "./OrderDetail.css"

const OrderDetail = ({ order, onBack }) => {
  if (!order) return null

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
          <h3>Tin nhân khách hàng</h3>
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
  )
}

export default OrderDetail
