"use client"

import { useState, useMemo } from "react"
import "./OrderManagement.css"
import OrderDetail from "./OrderDetail" // Declare the OrderDetail variable

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState("Tất cả")
  const [activeStatusTab, setActiveStatusTab] = useState("Tất cả")
  const [activeFilterTab, setActiveFilterTab] = useState("")
  const [searchId, setSearchId] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const mainTabs = ["Tất cả", "Chưa thanh toán", "Đang giao", "Đã vận chuyển", "Đã hoàn thành", "Đã hủy"]

  const statusTabs = ["Tất cả", "Đang chờ vận chuyển 0", "Đang chờ lấy hàng 1"]

  const filterTabs = ["Vận chuyển trong 24 giờ", "Quá hạn vận chuyển", "Hủy trong 24 giờ"]

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      // Remove order from allOrders array
      const updatedOrders = allOrders.filter((order) => order.id !== orderId)
      // You would typically update state here or call an API
      console.log("Đã xóa đơn hàng:", orderId)
      alert("Đã xóa đơn hàng thành công!")
    }
  }

  const handlePrintPackingSlip = (orderId) => {
    // Find the order to print
    const orderToPrint = allOrders.find((order) => order.id === orderId)
    if (!orderToPrint) {
      alert("Không tìm thấy đơn hàng!")
      return
    }

    // Create print content with all order information
    const printContent = `
    <html>
      <head>
        <title>Phiếu Đóng Gói - ${orderToPrint.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .order-info h3 { margin-bottom: 10px; color: #333; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-label { font-weight: bold; }
          .product-section { border: 1px solid #ddd; padding: 15px; margin: 20px 0; }
          .total-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PHIẾU ĐÓNG GÓI</h1>
          <h2>Mã đơn hàng: ${orderToPrint.id}</h2>
        </div>
        
        <div class="order-info">
          <h3>Thông tin đơn hàng:</h3>
          <div class="info-row">
            <span class="info-label">Mã đơn hàng:</span>
            <span>${orderToPrint.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày đặt hàng:</span>
            <span>${orderToPrint.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái:</span>
            <span>${orderToPrint.status}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phương thức thanh toán:</span>
            <span>${orderToPrint.paymentMethod}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phương thức giao hàng:</span>
            <span>${orderToPrint.delivery}</span>
          </div>
        </div>

        <div class="product-section">
          <h3>Thông tin sản phẩm:</h3>
          <div class="info-row">
            <span class="info-label">Tên sản phẩm:</span>
            <span>${orderToPrint.product}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số lượng:</span>
            <span>${orderToPrint.quantity}</span>
          </div>
        </div>

        <div class="total-section">
          <div class="info-row" style="font-size: 18px; font-weight: bold;">
            <span>Tổng tiền:</span>
            <span>${orderToPrint.total}</span>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Người giao hàng</div>
            <div class="signature-line">Ký tên</div>
          </div>
          <div class="signature-box">
            <div>Người nhận hàng</div>
            <div class="signature-line">Ký tên</div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          Ngày in: ${new Date().toLocaleString("vi-VN")}
        </div>
      </body>
    </html>
  `

    // Open new window and print
    const printWindow = window.open("", "_blank")
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const handleOrderIdClick = (orderId) => {
    const order = allOrders.find((order) => order.id === orderId)
    if (order) {
      setSelectedOrder(order)
      setShowOrderDetail(true)
    }
  }

  const handleBackToOrders = () => {
    setShowOrderDetail(false)
    setSelectedOrder(null)
  }

  // Sample orders data
  const allOrders = [
    {
      id: "V1234459",
      product: "vợt yonex 88d pro 2024",
      quantity: 1,
      status: "Đang giao",
      paymentStatus: "Chưa thanh toán",
      total: "5,420,000 VND",
      paymentMethod: "Thanh toán khi nhận hàng",
      date: "09/06/2025 20:30:30",
      delivery: "Giao hàng tiêu chuẩn J&T Express",
      isUrgent: false,
      isWithin24h: true,
      isOverdue: false,
      isCancelledWithin24h: false,
      waitingForShipping: false,
      waitingForPickup: true,
    },
    {
      id: "V1234460",
      product: "giày nike air max 2024",
      quantity: 2,
      status: "Chưa thanh toán",
      paymentStatus: "Chưa thanh toán",
      total: "3,200,000 VND",
      paymentMethod: "Chuyển khoản",
      date: "08/06/2025 15:20:10",
      delivery: "Giao hàng nhanh",
      isUrgent: true,
      isWithin24h: false,
      isOverdue: false,
      isCancelledWithin24h: false,
      waitingForShipping: true,
      waitingForPickup: false,
    },
    {
      id: "V1234461",
      product: "áo thun adidas",
      quantity: 3,
      status: "Đã vận chuyển",
      paymentStatus: "Đã thanh toán",
      total: "1,500,000 VND",
      paymentMethod: "Thẻ tín dụng",
      date: "07/06/2025 10:15:30",
      delivery: "Giao hàng tiêu chuẩn",
      isUrgent: false,
      isWithin24h: false,
      isOverdue: true,
      isCancelledWithin24h: false,
      waitingForShipping: false,
      waitingForPickup: false,
    },
    {
      id: "V1234462",
      product: "túi xách louis vuitton",
      quantity: 1,
      status: "Đã hủy",
      paymentStatus: "Đã hoàn tiền",
      total: "25,000,000 VND",
      paymentMethod: "Chuyển khoản",
      date: "09/06/2025 08:45:20",
      delivery: "Giao hàng cao cấp",
      isUrgent: false,
      isWithin24h: false,
      isOverdue: false,
      isCancelledWithin24h: true,
      waitingForShipping: false,
      waitingForPickup: false,
    },
  ]

  // Filter orders based on active tabs and search
  const filteredOrders = useMemo(() => {
    let filtered = allOrders

    // Filter by main tab
    if (activeTab !== "Tất cả") {
      filtered = filtered.filter((order) => order.status === activeTab)
    }

    // Filter by status tab
    if (activeStatusTab === "Đang chờ vận chuyển 0") {
      filtered = filtered.filter((order) => order.waitingForShipping)
    } else if (activeStatusTab === "Đang chờ lấy hàng 1") {
      filtered = filtered.filter((order) => order.waitingForPickup)
    }

    // Filter by filter tab
    if (activeFilterTab === "Vận chuyển trong 24 giờ") {
      filtered = filtered.filter((order) => order.isWithin24h)
    } else if (activeFilterTab === "Quá hạn vận chuyển") {
      filtered = filtered.filter((order) => order.isOverdue)
    } else if (activeFilterTab === "Hủy trong 24 giờ") {
      filtered = filtered.filter((order) => order.isCancelledWithin24h)
    }

    // Filter by search ID
    if (searchId.trim()) {
      filtered = filtered.filter((order) => order.id.toLowerCase().includes(searchId.toLowerCase()))
    }

    return filtered
  }, [activeTab, activeStatusTab, activeFilterTab, searchId, allOrders])

  const handleSearch = () => {
    // Search is handled automatically by the useMemo hook
    console.log("Searching for:", searchId)
  }

  return (
    <div className="order-management">
      {/* Main Navigation Tabs */}
      <div className="tab-container">
        {mainTabs.map((tab) => (
          <button key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="tab-container secondary">
        <span className="tab-label">Trạng thái đơn hàng</span>
        {statusTabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeStatusTab === tab ? "active" : ""}`}
            onClick={() => setActiveStatusTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="tab-container tertiary">
        <span className="tab-label">Khẩn cấp</span>
        {filterTabs.map((tab) => (
          <button
            key={tab}
            className={`tab filter-tab ${activeFilterTab === tab ? "active" : ""}`}
            onClick={() => setActiveFilterTab(activeFilterTab === tab ? "" : tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <select className="search-dropdown">
          <option>ID đơn hàng</option>
        </select>
        <input
          type="text"
          placeholder="Tìm kiếm ID đơn hàng"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="search-input"
        />
        
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID đơn hàng</th>
              <th>Trạng thái đơn hàng</th>
              <th>Thanh toán</th>
              <th>Giao hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="order-id-cell">
                      <div className="order-info">
                        <div className="order-id clickable" onClick={() => handleOrderIdClick(order.id)}>
                          {order.id}
                        </div>
                        <div className="product-info">
                          <div className="product-image"></div>
                          <span>{order.product}</span>
                          <span className="quantity">x{order.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="payment-info">
                      <div className="total">Tổng: {order.total}</div>
                      <div className="payment-method">{order.paymentMethod}</div>
                      <div className="date">{order.date}</div>
                    </div>
                  </td>
                  <td>
                    <div className="delivery-info">
                      <div className="delivery-status">Giao hàng tiêu chuẩn</div>
                      <div className="delivery-service">J&T Express</div>
                    </div>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="close-btn" onClick={() => handleDeleteOrder(order.id)}>
                        ✕
                      </button>
                      <button className="print-btn" onClick={() => handlePrintPackingSlip(order.id)}>
                        In phiếu đóng gói
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  Không tìm thấy đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showOrderDetail && selectedOrder && <OrderDetail order={selectedOrder} onBack={handleBackToOrders} />}
    </div>
  )
}

export default OrderManagement
