"use client"

import { useState, useEffect } from "react"
import { Search, X, Package, Truck, MapPin, Phone, Mail } from "lucide-react"
import "./OrderManagement.css"

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("ID đơn hàng")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const statusTabs = ["Tất cả", 'Chờ xác nhận', 'Chờ lấy', 'Đang vận chuyển',
      'Đang giao', 'Đã giao', 'Hoàn thành', 'Đã hủy', 'Trả hàng/hoàn tiền']

  const statusColors = {
    "Chờ xác nhận": { backgroundColor: "#fef3c7", color: "#92400e" },
    "Chờ thanh toán": { backgroundColor: "#fed7aa", color: "#c2410c" },
    "Chờ lấy": { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    "Đang vận chuyển": { backgroundColor: "#e9d5ff", color: "#7c3aed" },
    "Đang giao": { backgroundColor: "#c7d2fe", color: "#4338ca" },
    "Đã giao": { backgroundColor: "#dcfce7", color: "#166534" },
    "Hoàn thành": { backgroundColor: "#dcfce7", color: "#166534" },
    "Đã hủy": { backgroundColor: "#fecaca", color: "#dc2626" },
    "Tiến hành trả hàng/hoàn tiền": { backgroundColor: "#f3f4f6", color: "#374151" },
    "Đã trả hàng/hoàn tiền": { backgroundColor: "#dcfce7", color: "#166534" },
  }

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:4000/api/order")
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
  const handlePrintPackingSlip = (orderId) => {
    // Find the order
    const order = orders.find((o) => o._id === orderId)
    if (!order) return

    // Create print content
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>PHIẾU ĐÓNG GÓI</h2>
        <hr>
        <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
        <p><strong>Ngày tạo:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Khách hàng:</strong> ${order.shippingInfo.fullName}</p>
        <p><strong>Số điện thoại:</strong> ${order.shippingInfo.phone}</p>
        <p><strong>Địa chỉ:</strong> ${[
          order.shippingInfo.houseNumber,
          order.shippingInfo.address,
          order.shippingInfo.ward,
          order.shippingInfo.district,
          order.shippingInfo.city,
        ]
          .filter(Boolean)
          .join(", ")}</p>
        <hr>
        <h3>Danh sách sản phẩm:</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 8px;">SKU</th>
              <th style="padding: 8px;">Số lượng</th>
              <th style="padding: 8px;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px;">${item.sku_code}</td>
                <td style="padding: 8px;">${item.quantity}</td>
                <td style="padding: 8px;">${formatCurrency(item.priceAtTime)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <hr>
        <p><strong>Tổng tiền:</strong> ${formatCurrency(order.total_amount)}</p>
        <p><strong>Ghi chú:</strong> ${order.note || "Không có"}</p>
      </div>
    `

    // Open print window
    const printWindow = window.open("", "_blank")
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

const handleUpdateStatus = async (orderId) => {
  const order = orders.find((o) => o._id === orderId)
  if (!order) return

  const immutableStatuses = ["Đã trả hàng/hoàn tiền", "Đã hủy"]
  if (immutableStatuses.includes(order.status)) {
    alert("Không thể cập nhật trạng thái đơn hàng này!")
    return
  }

  // Đặc biệt xử lý luồng trả hàng
  if (order.status === "Tiến hành trả hàng/hoàn tiền") {
    const nextStatus = "Đã trả hàng/hoàn tiền"
    if (window.confirm(`Xác nhận chuyển sang trạng thái "${nextStatus}"?`)) {
      try {
        await updateOrderStatus(orderId, nextStatus)
        alert("Cập nhật trạng thái thành công!")
      } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật trạng thái!")
      }
    }
    return
  }

  // Các trạng thái bình thường
  const statusOptions = [
    "Chờ xác nhận",
    "Chờ lấy",
    "Đang vận chuyển",
    "Đang giao",
    "Đã giao",
  ]

  const currentIndex = statusOptions.indexOf(order.status)
  const nextStatus = statusOptions[currentIndex + 1]

  if (nextStatus) {
    if (window.confirm(`Cập nhật trạng thái đơn hàng từ "${order.status}" thành "${nextStatus}"?`)) {
      try {
        await updateOrderStatus(orderId, nextStatus)
        alert("Cập nhật trạng thái thành công!")
      } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật trạng thái!")
      }
    }
  } else {
    alert("Đơn hàng đã ở trạng thái cuối cùng!")
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
      (selectedStatus === "Hoàn thành" && order.status === "Hoàn thành") ||
      (selectedStatus === "Đã hủy" && order.status === "Đã hủy") ||
      (selectedStatus === "Trả hàng/hoàn tiền" && order.status === "Tiến hành trả hàng/hoàn tiền") ||
      (selectedStatus === "Trả hàng/hoàn tiền" && order.status === "Đã trả hàng/hoàn tiền")

    return matchesSearch && matchesStatus
  })

  return (
    <div className="order-management">
      {/* Header */}
      

      <div className="main-layout">
        <main className="main-content">
          {/* Status Tabs */}
          <div className="status-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
                className={`status-tab ${selectedStatus === tab ? "active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

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
                  <th>Giao hàng</th>
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
                        <div className="shipping-provider">{order.shipping_provider}</div>
                      </td>
                      <td>
                        <div className="om-action-buttons">
                          {/* <button
                            className="om-action-btn cancel-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelOrder(order._id)
                            }}
                            title="Hủy đơn hàng"
                          >
                            <X className="btn-icon" />
                          </button> */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePrintPackingSlip(order._id)
                            }}
                            className="om-action-btn print-btn"
                            title="In phiếu đóng gói"
                          >
                            In phiếu đóng gói
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(order._id)
                            }}
                            className="om-action-btn update-btn"
                            title="Cập nhật trạng thái"
                          >
                            Cập nhật trạng thái
                          </button>
                        </div>
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

export default AllOrdersPage

