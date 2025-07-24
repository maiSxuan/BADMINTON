"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Cart.css"

const initialCartItems = [
  {
    id: "nf700pro-4u5",
    name: "Vợt cầu lông Yonex Nanoflare 700pro",
    variantInfo: "Size: 4U5",
    price: 1111000,
    quantity: 2,
    imageUrl: "https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp",
    selected: false,
  },
  {
    id: "vic-a960-red-42",
    name: "Giày cầu lông Victor A960",
    variantInfo: "Màu: Đỏ, Size: 42",
    price: 950000,
    quantity: 1,
    imageUrl: "https://shopvnb.com/uploads/gallery/giay-cau-long-victor-a960-do-chinh-hang_1634714652.webp",
    selected: false,
  },
  {
    id: "lining-ax-black-3u",
    name: "Vợt cầu lông Lining Axforce 90",
    variantInfo: "Màu: Đen, Size: 3U",
    price: 1500000,
    quantity: 1,
    imageUrl:
      "https://shopvnb.com/uploads/gallery/vot-cau-long-lining-axforce-90-max-xanh-dragon-chinh-hang_1699928509.webp",
    selected: false,
  },
]

const CartPage = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    const selectedItems = cartItems.filter((item) => item.selected)
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(total)
    setSelectedCount(selectedItems.length)

    // Cập nhật trạng thái "Chọn tất cả"
    setSelectAll(cartItems.length > 0 && selectedItems.length === cartItems.length)
  }, [cartItems])

  const handleQuantityChange = (itemId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + amount
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }
        }
        return item
      }),
    )
  }

  const handleRemoveItem = (itemId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    }
  }

  const handleSelectItem = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, selected: !item.selected } : item)),
    )
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setCartItems((prevItems) => prevItems.map((item) => ({ ...item, selected: newSelectAll })))
  }

  const handleProceedToPurchase = () => {
    const selectedItems = cartItems.filter((item) => item.selected)

    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để mua hàng!")
      return
    }

    // Chuyển đến trang purchase với danh sách sản phẩm đã chọn
    navigate("/purchase", {
      state: {
        selectedItems: selectedItems.map((item) => ({
          id: item.id,
          name: item.name,
          variant: item.variantInfo,
          quantity: item.quantity,
          price: item.price,
          image: item.imageUrl,
        })),
      },
    })
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  return (
    <div className="cart-page-container">
      <div className="cart-content-wrapper">
        <div className="cart-header">
          <h1 className="cart-title">GIỎ HÀNG CỦA BẠN</h1>
          <p className="cart-subtitle">({cartItems.length} sản phẩm)</p>
        </div>

        {cartItems.length > 0 ? (
          <>
            {/* Header với checkbox chọn tất cả */}
            <div className="cart-header-controls">
              <div className="select-all-section">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="select-checkbox"
                />
                <label htmlFor="select-all" className="select-all-label">
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </label>
              </div>
              <div className="selected-info">Đã chọn: {selectedCount} sản phẩm</div>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className={`cart-item ${item.selected ? "selected" : ""}`}>
                  <div className="item-select">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleSelectItem(item.id)}
                      className="select-checkbox"
                    />
                  </div>

                  <div className="item-image-container">
                    <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="item-image" />
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-variant">{item.variantInfo}</p>
                    <p className="item-unit-price">Đơn giá: {formatCurrency(item.price)}</p>
                  </div>

                  <div className="item-quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input type="text" value={item.quantity} readOnly className="quantity-input" />
                    <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, 1)}>
                      +
                    </button>
                  </div>

                  <div className="item-price-section">
                    <p className="item-total-price">{formatCurrency(item.price * item.quantity)}</p>
                  </div>

                  <button className="item-remove-btn" onClick={() => handleRemoveItem(item.id)} title="Xóa sản phẩm">
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-info">
                <div className="selected-summary">
                  <span>Đã chọn {selectedCount} sản phẩm</span>
                </div>
                <div className="total-price-section">
                  <span className="total-label">Tổng tiền:</span>
                  <span className="total-value">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              <div className="cart-actions">
                <button className="continue-shopping-btn" onClick={() => navigate("/products")}>
                  Tiếp tục mua sắm
                </button>
                <button className="checkout-btn" onClick={handleProceedToPurchase} disabled={selectedCount === 0}>
                  Mua hàng ({selectedCount})
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cart-message">
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <button className="continue-shopping-btn primary" onClick={() => navigate("/products")}>
              Khám phá sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage