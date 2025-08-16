"use client"

import { useState, useEffect } from "react"
import { Search, X, Package, Truck, MapPin, Phone, Mail } from "lucide-react"
import "./OrderManagement.css"
import { getCancelledReqOrders, updateOrderStatus } from "../../services/orderService"
import Pagination from "../../components/common/Pagination"
import { usePopup } from "../../components/common/popupContext"

const CancelledOrderPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("ID đơn hàng")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const { showPopup } = usePopup();

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 15

  const statusColors = {
    "Yêu cầu hủy": { backgroundColor: "#fef3c7", color: "#92400e" },
    "Đã hủy": { backgroundColor: "#fecaca", color: "#dc2626" }
  }

  useEffect(() => {
    setCancellationOrder()
  }, [])

  const setCancellationOrder = async () => {
    try {
      setLoading(true)
      const result = await getCancelledReqOrders()
      setOrders(result)
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleAcceptCancellation = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        await updateOrderStatus(orderId, "Đã hủy")
        // alert("Đã hủy đơn hàng thành công!")
        showPopup(
          'Thông báo',
          'Đã hủy đơn hàng thành công',
          null,
          null,
          4,
          1
        )
        setCancellationOrder() // load lại sau khi duyệt
      } catch (err) {
        // alert("Có lỗi xảy ra khi hủy đơn hàng!")
        showPopup(
          'Thông báo',
          'Đã hủy đơn hàng thành công',
          null,
          null,
          4,
          1
        )
      }
    }
  }

  const handleOrderClick = (order, event) => {
    if (event.target.closest(".om-action-buttons")) {
      return
    }
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const closeOrderDetail = () => {
    setShowOrderDetail(false)
    setSelectedOrder(null)
  }

  // --- Lọc đơn hàng theo tìm kiếm ---
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    if (searchType === "ID đơn hàng") {
      return order._id.toLowerCase().includes(term)
    } else if (searchType === "Tên khách hàng") {
      return order.shippingInfo?.fullName?.toLowerCase().includes(term)
    } else if (searchType === "Số điện thoại") {
      return order.shippingInfo?.phone?.toLowerCase().includes(term)
    }
    return true
  })

  function LoadingSpinner() {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // --- Lấy đơn hàng của trang hiện tại ---
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  return (
    <div className="order-management">
      <div className="main-layout">
        <main className="main-content">
          {/* Search */}
          <div className="search-section">
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="search-select">
              <option>ID đơn hàng</option>
              <option>Tên khách hàng</option>
              <option>Số điện thoại</option>
            </select>
            <div className="om-search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={`Tìm kiếm ${searchType}`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // reset về trang 1 khi search
                }}
                className="om-search-input"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID đơn hàng</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Lý do</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // <tr>
                  //   <td colSpan="5" className="loading-cell">Đang tải...</td>
                  // </tr>
                  <LoadingSpinner />
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">Không có đơn hàng nào</td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order._id} className="order-row" onClick={(e) => handleOrderClick(order, e)}>
                      <td>
                        <div className="order-id-cell">
                          <div className="order-id-link">{order._id.slice(-12)}</div>
                          <div className="order-sku">{order.items.map((item) => item.sku_code).join(", ")}</div>
                          <div className="order-quantity">
                            x{order.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={statusColors[order.status] || { backgroundColor: "#f3f4f6", color: "#374151" }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="payment-info">
                          <div className="payment-total">Tổng: {formatCurrency(order.total_amount)}</div>
                          <div className="payment-method">Thanh toán khi nhận hàng</div>
                          <div className="payment-date">{formatDate(order.created_at)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="shipping-provider">{order.cancellation_reason}</div>
                      </td>
                      <td>
                        {order.status !== "Đã hủy" && (
                          <div className="om-action-buttons">
                            <button
                              className="om-action-btn cancel-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAcceptCancellation(order._id)
                              }}
                              title="Hủy đơn hàng"
                            >
                              Duyệt yêu cầu
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Phân trang */}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredOrders.length / ordersPerPage)}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="om-modal-overlay" onClick={closeOrderDetail}>
          <div className="om-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="om-modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder._id.slice(-8)}</h2>
              <button className="close-btn" onClick={closeOrderDetail}><X /></button>
            </div>

            <div className="om-modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h3><Package className="section-icon" /> Thông tin đơn hàng</h3>
                  <div className="detail-item"><span className="label">Mã đơn hàng:</span><span className="value">{selectedOrder._id}</span></div>
                  <div className="detail-item"><span className="label">Trạng thái:</span><span className="status-badge" style={statusColors[selectedOrder.status]}>{selectedOrder.status}</span></div>
                  <div className="detail-item"><span className="label">Ngày tạo:</span><span className="value">{formatDate(selectedOrder.created_at)}</span></div>
                  <div className="detail-item"><span className="label">Tổng tiền:</span><span className="value total-amount">{formatCurrency(selectedOrder.total_amount)}</span></div>
                </div>

                <div className="detail-section">
                  <h3><MapPin className="section-icon" /> Thông tin giao hàng</h3>
                  <div className="detail-item"><span className="label">Họ tên:</span><span className="value">{selectedOrder.shippingInfo.fullName}</span></div>
                  <div className="detail-item"><span className="label"><Phone className="inline-icon" /> Số điện thoại:</span><span className="value">{selectedOrder.shippingInfo.phone}</span></div>
                  {selectedOrder.shippingInfo.email && (
                    <div className="detail-item"><span className="label"><Mail className="inline-icon" /> Email:</span><span className="value">{selectedOrder.shippingInfo.email}</span></div>
                  )}
                  <div className="detail-item"><span className="label">Địa chỉ:</span><span className="value">{[selectedOrder.shippingInfo.address].filter(Boolean).join(", ")}</span></div>
                  <div className="detail-item"><span className="label"><Truck className="inline-icon" /> Nhà vận chuyển:</span><span className="value">{selectedOrder.shipping_provider}</span></div>
                </div>
              </div>

              <div className="detail-section full-width">
                <h3>Sản phẩm đã đặt</h3>
                <div className="items-table">
                  <table>
                    <thead>
                      <tr><th>SKU</th><th>Số lượng</th><th>Giá</th><th>Thành tiền</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.sku_code}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.priceAtTime)}</td>
                          <td>{formatCurrency(item.priceAtTime * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="detail-section full-width">
                  <h3>Ghi chú</h3>
                  <p className="note-text">{selectedOrder.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CancelledOrderPage
