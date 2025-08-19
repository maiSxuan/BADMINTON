"use client"

import { useState, useEffect } from "react"
import "./OrderHistory.css"
import { updateOrderStatus, getOrdersByUserId, requestReturnOrCancellation } from "../../services/orderService"
import { createRating } from "../../services/ratingService"
import Pagination from "../../components/common/Pagination" // điều chỉnh path nếu khác
import { usePopup } from "../../components/common/popupContext"

function ReasonDialog({ isOpen, onClose, onSubmit, title, description, placeholder, submitButtonText }) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    onSubmit(reason)
    setReason("")
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

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1
        return (
          <button
            type="button"
            key={starValue}
            className={starValue <= rating ? "star-button on" : "star-button off"}
            onClick={() => onRatingChange(starValue)}
          >
            &#9733;
          </button>
        )
      })}
    </div>
  )
}

// ===================================================================
// BƯỚC 3.2: TẠO COMPONENT REVIEW DIALOG
// ===================================================================
function ReviewDialog({ isOpen, onClose, order, userId }) {
  const [reviews, setReviews] = useState({}) // { productId: { rating: 0, comment: '' } }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showPopup } = usePopup()

  const handleReviewChange = (productId, field, value) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const reviewPromises = []

    for (const productId in reviews) {
      const review = reviews[productId]
      if (review.rating > 0 && review.comment?.trim()) {
        reviewPromises.push(
          createRating({
            orderId: order._id,
            productId: productId,
            userId: userId,
            rating: review.rating,
            comment: review.comment,
          })
        )
      }
    }

    if (reviewPromises.length === 0) {
      // alert("Vui lòng đánh giá và viết bình luận cho ít nhất một sản phẩm.")
      showPopup(
        'Thông báo',
        'Vui lòng chọn số sao và viết bình luận để đánh giá',
        null,
        null,
        4,
        3
      )
      setIsSubmitting(false)
      return
    }

    try {
      await Promise.all(reviewPromises)
      // alert("Cảm ơn bạn đã đánh giá sản phẩm!")
      showPopup(
        'Thông báo',
        'Cảm ơn bạn đã đánh giá sản phẩm',
        null,
        null,
        4,
        5
      )
      onClose()
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error)
      // alert(error.message || "Có lỗi xảy ra khi gửi đánh giá.")
      showPopup(
        'Lỗi',
        error.message || 'Có lỗi xảy ra khi gửi đánh giá',
        null,
        null,
        4,
        3
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="dialog-overlay">
      <div className="dialog-content review-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">Đánh giá sản phẩm</h2>
          <p className="dialog-description">
            Chia sẻ cảm nhận của bạn về các sản phẩm trong đơn hàng #{order._id.slice(-8)}
          </p>
        </div>
        <div className="dialog-body">
          {order.items.map((item) => (
            <div key={item.productId} className="review-item">
              <img src={item.image} alt={item.name} className="review-item-image" />
              <div className="review-item-details">
                <h4 className="review-item-name">{item.name}</h4>
                <p className="review-item-variant">
                  Phân loại: {item.color}, {item.size}
                </p>
                <div className="review-inputs">
                  <StarRating
                    rating={reviews[item.productId]?.rating || 0}
                    onRatingChange={(rating) => handleReviewChange(item.productId, "rating", rating)}
                  />
                  <textarea
                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                    value={reviews[item.productId]?.comment || ""}
                    onChange={(e) => handleReviewChange(item.productId, "comment", e.target.value)}
                    className="dialog-textarea review-textarea"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="dialog-footer">
          <button type="button" className="dialog-button dialog-button-outline" onClick={onClose}>
            Để sau
          </button>
          <button
            type="button"
            className="dialog-button dialog-button-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Hoàn tất"}
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
  const [currentUser, setCurrentUser] = useState(null)

  const { showPopup } = usePopup()

  // ===== PHÂN TRANG =====
  const ORDERS_PER_PAGE = 15
  const [currentPage, setCurrentPage] = useState(1)

  // Reason dialog
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [dialogType, setDialogType] = useState(null)
  const [currentOrderForAction, setCurrentOrderForAction] = useState(null)

  // Review dialog
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [orderToReview, setOrderToReview] = useState(null)

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user && user.userID) {
        setCurrentUser(user)
        setUserOrdersList(user.userID)
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

  // Reset về trang 1 khi số lượng đơn thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [orders.length])

  const setUserOrdersList = async (userId) => {
    try {
      setLoading(true)
      const orders = await getOrdersByUserId(userId)
      setOrders(orders)
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
      await updateOrderStatus(order._id, "Hoàn thành")
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: "Hoàn thành" } : o)))
      // alert("Đã xác nhận nhận hàng thành công!")
      showPopup(
        'Thông báo',
        'Đã xác nhận nhận hàng thành công',
        null,
        null,
        4,
        3
      )
    } catch (error) {
      console.error("Lỗi xác nhận nhận hàng:", error)
      // alert("Có lỗi xảy ra khi xác nhận nhận hàng.")
      showPopup(
        'Lỗi',
        error.message || 'Có lỗi xảy ra khi xác thực nhận hàng',
        null,
        null,
        4,
        3
      )
    }
  }

  const handleWriteReview = (order) => {
    setOrderToReview(order)
    setShowReviewDialog(true)
  }

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleReasonSubmit = async (reason) => {
    if (!currentOrderForAction || !dialogType) return
    try {
      const data = await requestReturnOrCancellation(currentOrderForAction._id, dialogType, reason)
      setOrders((prev) =>
        prev.map((o) => (o._id === currentOrderForAction._id ? { ...o, status: data.data.status } : o))
      )
      // alert(data.message)
      showPopup(
        'Thông báo',
        data.message,
        null,
        null,
        4,
        3
      )
    } catch (error) {
      console.error("Lỗi gửi yêu cầu:", error)
      // alert("Có lỗi xảy ra khi gửi yêu cầu.")
      showPopup(
        'Lỗi',
        error.message || 'Có lỗi xảy ra khi gửi yêu cầu',
        null,
        null,
        4,
        3
      )
    } finally {
      setShowReasonDialog(false)
      setCurrentOrderForAction(null)
      setDialogType(null)
    }
  }

  // ====== TÍNH TOÁN PHÂN TRANG ======
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1
  const indexOfLast = currentPage * ORDERS_PER_PAGE
  const indexOfFirst = indexOfLast - ORDERS_PER_PAGE
  const currentOrders = orders.slice(indexOfFirst, indexOfLast)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
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
        <>
          <div className="orders-list">
            {currentOrders.map((order) => (
              <div key={order._id} className="order-card">
                {/* Header đơn hàng */}
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">Mã đơn hàng: {order._id.slice(-8)}</span>
                    <span className="order-date">Ngày đặt: {formatDate(order.created_at)}</span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>{order.status}</span>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="history-order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="history-order-item">
                      <img
                        src={item.thumbnail_url || item.image || "/placeholder.svg?height=80&width=80&text=Product"}
                        alt={item.name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-variant">Phân loại hàng: {item.variant_name || item.sku_code || "Mặc định"}</p>
                        <div className="item-price-info">
                          <span className="item-quantity">x{item.quantity}</span>
                          {/* Giữ nguyên logic cũ: hiển thị tổng đơn ở mỗi item */}
                          <span className="item-price">{formatPrice(calculateOrderTotal(order.items))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="order-footer">
                  <div className="total-amount">
                    <span className="total-label">Thành tiền:</span>
                    <span className="total-price">{formatPrice(calculateOrderTotal(order.items))}</span>
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

          {/* PHÂN TRANG */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
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

      {/* Review Dialog */}
      {showReviewDialog && orderToReview && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          order={orderToReview}
          userId={currentUser?.userID}
        />
      )}
    </div>
  )
}

// ... (component OrderDetail giữ nguyên)

const OrderDetail = ({ order, onBack }) => {
  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }
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
                  <span className="info-label">Mã đơn hàng:</span> {order._id.slice(-8)}
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
                  {[order.shippingInfo.address].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="detail-section">
          <h3 className="section-title">Sản phẩm đã đặt</h3>
          <div className="history-order-items">
            {order.items.map((item, index) => (
              <div key={index} className="history-order-item">
                <img
                  src={item.thumbnail_url || item.image || "/placeholder.svg?height=80&width=80&text=Product"}
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-variant">Phân loại hàng: {item.variant_name || item.sku_code || "Mặc định"}</p>
                  <div className="item-price-info">
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">{formatPrice(calculateOrderTotal(order.items))}</span>
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
            <span className="final-price">{formatPrice(calculateOrderTotal(order.items))}</span>
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
