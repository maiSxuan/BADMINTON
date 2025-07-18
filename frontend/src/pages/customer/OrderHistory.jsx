"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./OrderHistory.css"

const mockOrders = [
  {
    _id: "ORDER004",
    status: "Hoàn thành",
    totalPrice: 280000,
    items: [
      {
        _id: "p1-confirm",
        name: "Vợt cầu lông Yonex Nanoflare 700pro",
        variant: "Phân loại hàng: 4U5",
        price: 280000,
        quantity: 1,
        imageUrl:
          "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
      },
    ],
  },
  {
    _id: "ORDER001",
    status: "Hoàn thành",
    totalPrice: 280000,
    items: [
      {
        _id: "p1",
        name: "Vợt cầu lông Yonex Nanoflare 700pro",
        variant: "Phân loại hàng: 4U5",
        price: 280000,
        quantity: 1,
        imageUrl:
          "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
      },
    ],
  },
  {
    _id: "ORDER002",
    status: "Hoàn thành",
    totalPrice: 560000,
    items: [
      {
        _id: "p2",
        name: "Vợt cầu lông Yonex Nanoflare 700pro",
        variant: "Phân loại hàng: 4U5 xanh",
        price: 280000,
        quantity: 1,
        imageUrl:
          "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
      },
      {
        _id: "p3",
        name: "Vợt cầu lông Yonex Nanoflare 700pro",
        variant: "Phân loại hàng: 4U5",
        price: 280000,
        quantity: 1,
        imageUrl:
          "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
      },
    ],
  },
  {
    _id: "ORDER003",
    status: "Chờ giao hàng",
    totalPrice: 560000,
    items: [
      {
        _id: "p4",
        name: "Vợt cầu lông Yonex Nanoflare 700pro",
        variant: "Phân loại hàng: 4U5",
        price: 280000,
        quantity: 1,
        imageUrl:
          "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
      },
      {
        _id: "p5",
        name: "Vợt cầu lông Yonex Nanoflare 700pro",
        variant: "Phân loại hàng: 4U5",
        price: 280000,
        quantity: 1,
        imageUrl:
          "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
      },
    ],
  },
]

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("Tất cả")
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const sortedOrders = mockOrders.sort((a, b) => {
      const order = ["Chờ xác nhận", "Hoàn thành", "Đã hủy", "Chờ giao hàng"]
      return order.indexOf(a.status) - order.indexOf(b.status)
    })
    setOrders(sortedOrders)
  }, [])

  useEffect(() => {
    if (activeTab === "Tất cả") {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter((order) => order.status === activeTab))
    }
  }, [activeTab, orders])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "decimal", currency: "VND" }).format(amount) + "đ"

  const handleOpenRatingModal = (order) => {
    setSelectedOrder(order)
    setShowRatingModal(true)
    setRatings({})
    setComments({})
  }

  const handleCloseRatingModal = () => {
    setShowRatingModal(false)
    setSelectedOrder(null)
    setRatings({})
    setComments({})
  }

  const handleRatingChange = (productId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [productId]: rating,
    }))
  }

  const handleCommentChange = (productId, comment) => {
    setComments((prev) => ({
      ...prev,
      [productId]: comment,
    }))
  }

  const handleSubmitRating = (e) => {
    e.preventDefault()

    if (!selectedOrder) return

    const reviewData = selectedOrder.items
      .map((product) => ({
        productId: product._id,
        productName: product.name,
        rating: ratings[product._id] || 0,
        comment: comments[product._id] || "",
      }))
      .filter((review) => review.rating > 0)

    if (reviewData.length === 0) {
      alert("Vui lòng đánh giá ít nhất một sản phẩm!")
      return
    }

    console.log("Đánh giá cho đơn hàng:", selectedOrder._id, reviewData)
    alert("Cảm ơn bạn đã đánh giá!")

    handleCloseRatingModal()
  }

  const renderStars = (productId, currentRating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= currentRating ? "active" : ""}`}
          onClick={() => handleRatingChange(productId, i)}
        >
          ★
        </span>,
      )
    }
    return stars
  }

  const tabs = [
    "Tất cả",
    "Chờ xác nhận",
    "Chờ thanh toán",
    "Vận chuyển",
    "Chờ giao hàng",
    "Hoàn thành",
    "Đã hủy",
    "Trả hàng/Hoàn tiền",
  ]

  return (
    <div className="order-history-container">
      {/* Tabs */}
      <div className="tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Danh sách đơn */}
      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-status-header">
                <span>{order.status}</span>
              </div>
              <div className="order-body">
                {order.items.map((item) => (
                  <div key={item._id} className="order-item">
                    <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-variant">{item.variant}</p>
                    </div>
                    <span className="item-price">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Section đánh giá chỉ hiển thị khi đơn hàng hoàn thành */}
              {order.status === "Hoàn thành" && (
                <div className="review-section">
                  <span>Đánh giá sản phẩm</span>
                  <button className="btn btn-red" onClick={() => handleOpenRatingModal(order)}>
                    Viết đánh giá
                  </button>
                </div>
              )}

              <div className="order-footer">
                <div className="total-price-container">
                  <span>Thành tiền:</span>
                  <span className="total-price-amount">{formatCurrency(order.totalPrice)}</span>
                </div>
                <div className="order-actions">
                  {order.status === "Chờ xác nhận" && <button className="btn btn-gray">Hủy đơn hàng</button>}
                  {order.status === "Hoàn thành" && (
                    <>
                      <button className="btn btn-red">Mua lại</button>
                      <button className="btn btn-gray">Xem chi tiết</button>
                      <button onClick={() => navigate("/return-refund")} className="btn btn-gray">
                        Trả hàng/hoàn tiền
                      </button>
                    </>
                  )}
                  {order.status === "Chờ giao hàng" && <button className="btn btn-red">Đã nhận được hàng</button>}
                  {order.status === "Đã hủy" && (
                    <>
                      <button className="btn btn-red">Mua lại</button>
                      <button className="btn btn-gray">Xem chi tiết</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders-message">
            <p>Chưa có đơn hàng nào trong mục này.</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseRatingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đánh giá đơn hàng #{selectedOrder._id}</h2>
              <button className="close-btn" onClick={handleCloseRatingModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="rating-form">
              {selectedOrder.items.map((product) => (
                <div key={product._id} className="product-rating">
                  <div className="product-info">
                    {/* <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="product-image" /> */}
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p className="product-variant">{product.variant}</p>
                      <p className="product-price">
                        {product.price.toLocaleString("vi-VN")}đ × {product.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="rating-section">
                    <label>Đánh giá sản phẩm:</label>
                    <div className="stars-container">
                      {renderStars(product._id, ratings[product._id] || 0)}
                      {ratings[product._id] && <span className="rating-text">({ratings[product._id]} sao)</span>}
                    </div>
                  </div>

                  <div className="comment-section">
                    <label>Nhận xét:</label>
                    <textarea
                      value={comments[product._id] || ""}
                      onChange={(e) => handleCommentChange(product._id, e.target.value)}
                      placeholder={`Chia sẻ trải nghiệm của bạn về ${product.name}...`}
                      rows="3"
                    />
                  </div>
                </div>
              ))}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseRatingModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistoryPage
