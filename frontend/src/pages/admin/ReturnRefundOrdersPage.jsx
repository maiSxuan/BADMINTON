"use client"

import { useState, useEffect } from "react"
import { Search, X, Package, Truck, MapPin, Phone, Mail } from "lucide-react"
import "./OrderManagement.css"

const ReturnReundOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus] = useState("Tất cả")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("ID đơn hàng")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)


  const statusColors = {
    "Yêu cầu trả hàng/hoàn tiền": { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    "Hoàn tất trả hàng/hoàn tiền": { backgroundColor: "#f3f4f6", color: "#374151" }
  }

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:4000/api/order/return-refund-orders")
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/order/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        fetchOrders()
        // Update selected order if it's currently being viewed
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error)
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

  const handleAcceptReturnRefund = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "Tiến hành trả hàng/hoàn tiền")
      alert("Đã chấp nhận yêu cầu hoàn trả/hoàn tiền!")
    } catch (error) {
      alert("Có lỗi xảy ra khi chấp nhận yêu cầu!")
    }
  }


  const handleOrderClick = (order, event) => {
    // Only open detail if not clicking on action buttons
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm === "" || order._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatus === "Tất cả" ||
      (selectedStatus === "Chờ xác nhận" && order.status === "Chờ xác nhận") ||
      (selectedStatus === "Đang vận chuyển" && order.status === "Đang vận chuyển") ||
      (selectedStatus === "Chờ lấy" && order.status === "Chờ lấy") ||
      (selectedStatus === "Đang giao" && order.status === "Đang giao") ||
      (selectedStatus === "Đã giao" && order.status === "Đã giao") ||
      (selectedStatus === "Hoàn thành" && order.status === "Hoàn thành")

    return matchesSearch && matchesStatus
  })

  return (
    <div className="order-management">
      {/* Header */}
      

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
                placeholder="Tìm kiếm ID đơn hàng"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <tr>
                    <td colSpan="5" className="loading-cell">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
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
                        <div className="shipping-provider">{order.return_reason}</div>
                      </td>
                      <td>
                      {(
                        <div className="om-action-buttons">
                          <button
                            className="om-action-btn cancel-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptReturnRefund(order._id);
                            }}
                            title="Duyệt yêu cầu"
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
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="om-modal-overlay" onClick={closeOrderDetail}>
          <div className="om-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="om-modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder._id.slice(-8)}</h2>
              <button className="close-btn" onClick={closeOrderDetail}>
                <X />
              </button>
            </div>

            <div className="om-modal-body">
              <div className="order-detail-grid">
                {/* Order Status */}
                <div className="detail-section">
                  <h3>
                    <Package className="section-icon" /> Thông tin đơn hàng
                  </h3>
                  <div className="detail-item">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value">{selectedOrder._id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className="status-badge" style={statusColors[selectedOrder.status]}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Tổng tiền:</span>
                    <span className="value total-amount">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="detail-section">
                  <h3>
                    <MapPin className="section-icon" /> Thông tin giao hàng
                  </h3>
                  <div className="detail-item">
                    <span className="label">Họ tên:</span>
                    <span className="value">{selectedOrder.shippingInfo.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">
                      <Phone className="inline-icon" /> Số điện thoại:
                    </span>
                    <span className="value">{selectedOrder.shippingInfo.phone}</span>
                  </div>
                  {selectedOrder.shippingInfo.email && (
                    <div className="detail-item">
                      <span className="label">
                        <Mail className="inline-icon" /> Email:
                      </span>
                      <span className="value">{selectedOrder.shippingInfo.email}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">
                      {[
                        selectedOrder.shippingInfo.address,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">
                      <Truck className="inline-icon" /> Nhà vận chuyển:
                    </span>
                    <span className="value">{selectedOrder.shipping_provider}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="detail-section full-width">
                <h3>Sản phẩm đã đặt</h3>
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Thành tiền</th>
                      </tr>
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

              {/* Notes */}
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

export default ReturnReundOrdersPage 