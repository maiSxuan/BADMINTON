"use client"

import { useState, useMemo } from "react"
import "./CancelledOrdersPage.css"

const CancelledOrders = () => {
  const [searchId, setSearchId] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [searchType, setSearchType] = useState("cancelRequestId")
  const [processing, setProcessing] = useState({})

  // Dữ liệu mẫu nhiều hơn để test
  const [orderData, setOrderData] = useState([
    {
      cancelRequestId: "HT123467",
      cancelRequestDate: "12/06/2025 7:55:23",
      orderId: "DH123467",
      cancelReason: "Không còn nhu cầu mua",
      refundAmount: "3,450,000 VND",
      refundAmountNumber: 3450000,
      status: "Chờ xử lý",
      statusDate: "12/06/2025 7:55:23",
      dateCreated: new Date("2025-06-12T07:55:23"),
    },
    {
      cancelRequestId: "HT123468",
      cancelRequestDate: "12/06/2025 8:15:30",
      orderId: "DH123468",
      cancelReason: "Sản phẩm không đúng mô tả",
      refundAmount: "2,750,000 VND",
      refundAmountNumber: 2750000,
      status: "Đã xác nhận",
      statusDate: "12/06/2025 8:30:45",
      dateCreated: new Date("2025-06-12T08:15:30"),
    },
    {
      cancelRequestId: "HT123469",
      cancelRequestDate: "11/06/2025 14:20:15",
      orderId: "DH123469",
      cancelReason: "Giao hàng quá chậm",
      refundAmount: "1,200,000 VND",
      refundAmountNumber: 1200000,
      status: "Từ chối",
      statusDate: "11/06/2025 15:45:30",
      dateCreated: new Date("2025-06-11T14:20:15"),
    },
    {
      cancelRequestId: "HT123470",
      cancelRequestDate: "10/06/2025 16:30:45",
      orderId: "DH123470",
      cancelReason: "Thay đổi ý định mua hàng",
      refundAmount: "5,800,000 VND",
      refundAmountNumber: 5800000,
      status: "Chờ xử lý",
      statusDate: "10/06/2025 16:30:45",
      dateCreated: new Date("2025-06-10T16:30:45"),
    },
    {
      cancelRequestId: "HT123471",
      cancelRequestDate: "09/06/2025 10:15:20",
      orderId: "DH123471",
      cancelReason: "Sản phẩm bị lỗi",
      refundAmount: "4,100,000 VND",
      refundAmountNumber: 4100000,
      status: "Đã xác nhận",
      statusDate: "09/06/2025 11:20:15",
      dateCreated: new Date("2025-06-09T10:15:20"),
    },
  ])

  // Logic tìm kiếm và sắp xếp
  const filteredAndSortedData = useMemo(() => {
    let filtered = orderData

    // Tìm kiếm theo ID
    if (searchId.trim()) {
      filtered = orderData.filter((order) => {
        if (searchType === "cancelRequestId") {
          return order.cancelRequestId.toLowerCase().includes(searchId.toLowerCase())
        } else if (searchType === "orderId") {
          return order.orderId.toLowerCase().includes(searchId.toLowerCase())
        }
        return true
      })
    }

    // Sắp xếp
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.dateCreated) - new Date(a.dateCreated) // Mới nhất trước
          case "amount":
            return b.refundAmountNumber - a.refundAmountNumber // Cao nhất trước
          case "status":
            return a.status.localeCompare(b.status) // A-Z
          case "cancelRequestId":
            return a.cancelRequestId.localeCompare(b.cancelRequestId) // A-Z
          case "orderId":
            return a.orderId.localeCompare(b.orderId) // A-Z
          default:
            return 0
        }
      })
    }

    return filtered
  }, [orderData, searchId, searchType, sortBy])

  const handleConfirm = async (orderId) => {
    setProcessing((prev) => ({ ...prev, [orderId]: "confirming" }))

    // Simulate API call
    setTimeout(() => {
      setOrderData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: "Đã xác nhận",
                statusDate: new Date().toLocaleString("vi-VN"),
              }
            : order,
        ),
      )
      setProcessing((prev) => ({ ...prev, [orderId]: null }))
      alert(`Đã xác nhận yêu cầu hủy đơn hàng ${orderId}`)
    }, 1000)
  }

  const handleReject = async (orderId) => {
    setProcessing((prev) => ({ ...prev, [orderId]: "rejecting" }))

    // Simulate API call
    setTimeout(() => {
      setOrderData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: "Từ chối",
                statusDate: new Date().toLocaleString("vi-VN"),
              }
            : order,
        ),
      )
      setProcessing((prev) => ({ ...prev, [orderId]: null }))
      alert(`Đã từ chối yêu cầu hủy đơn hàng ${orderId}`)
    }, 1000)
  }

  const handleSearch = () => {
    // Tìm kiếm sẽ tự động thực hiện thông qua useMemo
    console.log(`Tìm kiếm ${searchType}: ${searchId}`)
  }

  const clearSearch = () => {
    setSearchId("")
  }

  return (
    <div className="order-management">
      <h1 className="page-title">Quản lý yêu cầu hủy</h1>

      <div className="search-section">
        <div className="search-left">
          <div className="dropdown-container">
            <select className="dropdown" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="cancelRequestId">ID yêu cầu hủy</option>
              <option value="orderId">ID đơn hàng</option>
            </select>
          </div>

          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder={`Nhập ${searchType === "cancelRequestId" ? "ID yêu cầu hủy" : "ID đơn hàng"}`}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchId && (
              <button className="clear-button" onClick={clearSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            <button className="search-button" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="search-right">
          <div className="dropdown-container">
            <select className="dropdown sort-dropdown" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Sắp xếp theo</option>
              <option value="date">Ngày tạo (Mới nhất)</option>
              <option value="amount">Số tiền (Cao nhất)</option>
              <option value="status">Trạng thái (A-Z)</option>
              <option value="cancelRequestId">ID yêu cầu hủy (A-Z)</option>
              <option value="orderId">ID đơn hàng (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-info">
        <span className="results-count">
          Hiển thị {filteredAndSortedData.length} / {orderData.length} kết quả
          {searchId && ` cho "${searchId}"`}
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID đơn hàng yêu cầu hủy</th>
              <th>ID đơn hàng</th>
              <th>Lý do hủy</th>
              <th>Tổng hoàn tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((order, index) => (
                <tr key={index}>
                  <td>
                    <div className="id-cell">
                      <div className="id-main">{order.cancelRequestId}</div>
                      <div className="id-date">{order.cancelRequestDate}</div>
                    </div>
                  </td>
                  <td>{order.orderId}</td>
                  <td>{order.cancelReason}</td>
                  <td className="amount">{order.refundAmount}</td>
                  <td>
                    <div className="status-cell">
                      <div className={`status-main status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {order.status}
                      </div>
                      <div className="status-date">{order.statusDate}</div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {order.status === "Chờ xử lý" ? (
                        <>
                          <button
                            className="btn-confirm"
                            onClick={() => handleConfirm(order.orderId)}
                            disabled={processing[order.orderId]}
                          >
                            {processing[order.orderId] === "confirming" ? "Đang xử lý..." : "Xác nhận"}
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(order.orderId)}
                            disabled={processing[order.orderId]}
                          >
                            {processing[order.orderId] === "rejecting" ? "Đang xử lý..." : "Từ chối"}
                          </button>
                        </>
                      ) : (
                        <span className="status-processed">Đã xử lý</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  Không tìm thấy kết quả nào
                  {searchId && ` cho "${searchId}"`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CancelledOrders
