"use client"

import { useState, useEffect } from "react"
import "./OrderHistory.css" // Import the CSS file

// ReasonDialog component for collecting cancellation/return reasons
function ReasonDialog({ isOpen, onClose, onSubmit, title, description, placeholder, submitButtonText }) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    onSubmit(reason)
    setReason("") // Clear input after submission
  }

  if (!isOpen) return null

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <p className="dialog-description">{description}</p>
        </div>
        <div className="dialog-body">
          <label htmlFor="reason" className="dialog-label">
            Lý do
          </label>
          <textarea
            id="reason"
            placeholder={placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="dialog-textarea"
          />
        </div>
        <div className="dialog-footer">
          <button type="button" className="dialog-button dialog-button-outline" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="dialog-button dialog-button-primary"
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [userIdNotFound, setUserIdNotFound] = useState(false)

  // States for the reason dialog
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [dialogType, setDialogType] = useState(null) // 'return' or 'cancel'
  const [currentOrderForAction, setCurrentOrderForAction] = useState(null)

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user && user.userID) {
        const userId = user.userID
        fetchOrders(userId)
      } else {
        setLoading(false)
        setUserIdNotFound(true)
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
      setLoading(false)
      setUserIdNotFound(true)
    }
  }, [])

  const fetchOrders = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/order/user/${userId}`)
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      "Chờ xác nhận": "status-waiting",
      "Chờ thanh toán": "status-payment",
      "Chờ lấy": "status-pickup",
      "Đang vận chuyển": "status-shipping",
      "Đang giao": "status-delivering",
      "Đã giao": "status-delivered",
      "Hoàn thành": "status-completed",
      "Đã hủy": "status-cancelled",
      "Đã trả hàng/hoàn tiền": "status-returned",
      "Yêu cầu trả hàng/hoàn tiền": "status-returned-request",
      "Yêu cầu hủy": "status-cancelled-request",
    }
    return statusClasses[status] || "status-default"
  }

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleReturnRefund = (order) => {
    setCurrentOrderForAction(order)
    setDialogType("return")
    setShowReasonDialog(true)
  }

  const handleCancellation = (order) => {
    setCurrentOrderForAction(order)
    setDialogType("cancel")
    setShowReasonDialog(true)
  }

const handleConfirmReceived = async (order) => {
  try {
    const response = await fetch(`http://localhost:4000/api/order/${order._id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "Hoàn thành" }), // gửi status mới
    });

    if (response.ok) {
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === order._id ? { ...o, status: "Hoàn thành" } : o
        )
      );
      alert("Đã xác nhận nhận hàng thành công!");
    } else {
      alert("Có lỗi xảy ra khi xác nhận nhận hàng");
    }
  } catch (error) {
    console.error("Lỗi khi xác nhận nhận hàng:", error);
    alert("Có lỗi xảy ra khi xác nhận nhận hàng");
  }
};

  const handleWriteReview = (order) => {
    console.log("Viết đánh giá cho đơn hàng:", order._id)
    alert("Chuyển đến trang đánh giá sản phẩm")
  }

  const handleReasonSubmit = async (reason) => {
    if (!currentOrderForAction || !dialogType) return

    try {
      const response = await fetch(`http://localhost:4000/api/order/request/${currentOrderForAction._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: dialogType, reason }),
      })

      const data = await response.json()

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === currentOrderForAction._id ? { ...o, status: data.data.status } : o)),
        )
        alert(data.message)
      } else {
        alert(data.message || "Có lỗi xảy ra khi gửi yêu cầu.")
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu hủy/trả hàng:", error)
      alert("Có lỗi xảy ra khi gửi yêu cầu hủy/trả hàng.")
    } finally {
      setShowReasonDialog(false)
      setCurrentOrderForAction(null)
      setDialogType(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (userIdNotFound) {
    return (
      <div className="order-history-container">
        <div className="empty-orders">
          <p>Vui lòng đăng nhập để xem lịch sử mua hàng</p>
        </div>
      </div>
    )
  }

  if (showOrderDetail && selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setShowOrderDetail(false)} />
  }

  return (
    <div className="order-history-container">
      <h1 className="page-title">Lịch sử mua hàng</h1>
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Header đơn hàng */}
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Mã đơn hàng: #{order._id.slice(-8)}</span>
                  <span className="order-date">Ngày đặt: {formatDate(order.created_at)}</span>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>{order.status}</span>
              </div>
              {/* Danh sách sản phẩm */}
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={item.thumbnail_url || item.image || "/placeholder.svg?height=80&width=80&text=Product"}
                      alt={item.name}
                      className="item-image"
                      width={80}
                      height={80}
                    />
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-variant">Phân loại hàng: {item.variant_name || item.sku_code || "Mặc định"}</p>
                      <div className="item-price-info">
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="order-footer">
                <div className="total-amount">
                  <span className="total-label">Thành tiền:</span>
                  <span className="total-price">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="order-actions">
                  {order.status === "Chờ xác nhận" && (
                    <>
                      <button onClick={() => handleCancellation(order)} className="history-btn history-btn-primary">
                        Hủy đơn hàng
                      </button>
                    </>
                  )}
                  {order.status === "Đã giao" && (
                    <>
                      <button onClick={() => handleConfirmReceived(order)} className="history-btn history-btn-primary">
                        Đã nhận được hàng
                      </button>
                      <button onClick={() => handleReturnRefund(order)} className="history-btn history-btn-secondary">
                        Trả hàng/hoàn tiền
                      </button>
                    </>
                  )}
                  {order.status === "Hoàn thành" && (
                    <>
                      <button onClick={() => handleWriteReview(order)} className="history-btn history-btn-primary">
                        Đánh giá
                      </button>
                    </>
                  )}
                  <button onClick={() => handleOrderClick(order)} className="history-btn history-btn-secondary">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reason Dialog */}
      {showReasonDialog && dialogType && (
        <ReasonDialog
          isOpen={showReasonDialog}
          onClose={() => setShowReasonDialog(false)}
          onSubmit={handleReasonSubmit}
          title={dialogType === "return" ? "Yêu cầu trả hàng/hoàn tiền" : "Hủy đơn hàng"}
          description={
            dialogType === "return"
              ? "Vui lòng nhập lý do bạn muốn trả hàng/hoàn tiền cho đơn hàng này."
              : "Vui lòng nhập lý do bạn muốn hủy đơn hàng này."
          }
          placeholder={
            dialogType === "return"
              ? "Ví dụ: Sản phẩm bị lỗi, không đúng mô tả,..."
              : "Ví dụ: Thay đổi ý định, đặt nhầm đơn,..."
          }
          submitButtonText={dialogType === "return" ? "Gửi yêu cầu trả hàng" : "Gửi yêu cầu hủy"}
        />
      )}
    </div>
  )
}

const OrderDetail = ({ order, onBack }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ"
  }
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const getStatusClass = (status) => {
    const statusClasses = {
      "Chờ xác nhận": "status-waiting",
      "Chờ thanh toán": "status-payment",
      "Chờ lấy": "status-pickup",
      "Đang vận chuyển": "status-shipping",
      "Đang giao": "status-delivering",
      "Đã giao": "status-delivered",
      "Hoàn thành": "status-completed",
      "Đã hủy": "status-cancelled",
      "Đã trả hàng/hoàn tiền": "status-returned",
      "Yêu cầu trả hàng/hoàn tiền": "status-returned-request",
      "Yêu cầu hủy": "status-cancelled-request",
    }
    return statusClasses[status] || "status-default"
  }

  return (
    <div className="order-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          <span className="sr-only">Quay lại</span>
        </button>
        <h1 className="detail-title">Chi tiết đơn hàng #{order._id.slice(-8)}</h1>
      </div>
      <div className="detail-card">
        {/* Thông tin đơn hàng */}
        <div className="detail-section">
          <div className="detail-grid">
            <div className="detail-column">
              <h3 className="section-title">Thông tin đơn hàng</h3>
              <div className="info-list">
                <p>
                  <span className="info-label">Mã đơn hàng:</span> #{order._id.slice(-8)}
                </p>
                <p>
                  <span className="info-label">Ngày đặt:</span> {formatDate(order.created_at)}
                </p>
                <p>
                  <span className="info-label">Trạng thái:</span>{" "}
                  <span className={`order-status ${getStatusClass(order.status)}`}>{order.status}</span>
                </p>
                {order.payment_method && (
                  <p>
                    <span className="info-label">Phương thức thanh toán:</span> {order.payment_method}
                  </p>
                )}
                {order.shipping_provider && (
                  <p>
                    <span className="info-label">Đơn vị vận chuyển:</span> {order.shipping_provider}
                  </p>
                )}
              </div>
            </div>
            <div className="detail-column">
              <h3 className="section-title">Thông tin giao hàng</h3>
              <div className="info-list">
                <p>
                  <span className="info-label">Người nhận:</span> {order.shippingInfo.fullName}
                </p>
                <p>
                  <span className="info-label">Số điện thoại:</span> {order.shippingInfo.phone}
                </p>
                {order.shippingInfo.email && (
                  <p>
                    <span className="info-label">Email:</span> {order.shippingInfo.email}
                  </p>
                )}
                <p>
                  <span className="info-label">Địa chỉ:</span>{" "}
                  {[
                    order.shippingInfo.houseNumber,
                    order.shippingInfo.address,
                    order.shippingInfo.ward,
                    order.shippingInfo.district,
                    order.shippingInfo.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Danh sách sản phẩm */}
        <div className="detail-section">
          <h3 className="section-title">Sản phẩm đã đặt</h3>
          <div className="detail-items">
            {order.items.map((item, index) => (
              <div key={index} className="detail-item">
                <img
                  src={item.thumbnail_url || item.image || "/placeholder.svg?height=80&width=80&text=Product"}
                  alt={item.name}
                  className="detail-item-image"
                  width={80}
                  height={80}
                />
                <div className="detail-item-info">
                  <h4 className="detail-item-name">{item.name}</h4>
                  <p className="detail-item-variant">Phân loại: {item.variant_name || item.sku_code || "Mặc định"}</p>
                  <div className="detail-item-pricing">
                    <span className="detail-item-quantity">Số lượng: {item.quantity}</span>
                    <div className="detail-item-prices">
                      <p className="unit-price">Đơn giá: {formatPrice(item.price)}</p>
                      <p className="total-item-price">Thành tiền: {formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tổng tiền */}
        <div className="detail-section">
          <div className="final-total">
            <span>Tổng cộng:</span>
            <span className="final-price">{formatPrice(order.total_amount)}</span>
          </div>
          {order.note && (
            <div className="note-section">
              <p>
                <span className="note-label">Ghi chú:</span> {order.note}
              </p>
            </div>
          )}
          {(order.cancellation_reason || order.return_reason) && (
            <div className="reason-section">
              {order.cancellation_reason && (
                <p>
                  <span className="reason-label">Lý do hủy:</span> {order.cancellation_reason}
                </p>
              )}
              {order.return_reason && (
                <p>
                  <span className="reason-label">Lý do trả hàng:</span> {order.return_reason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
