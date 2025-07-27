"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Purchase.css"

const PurchasePage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Lấy danh sách sản phẩm từ Cart
  const [cartItems, setCartItems] = useState([])
  const [currentStep, setCurrentStep] = useState("cart")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    houseNumber: "",
    storeLocation: "",
    note: "",
    shippingMethod: "",
    saveInfo: false,
  })
  const user = JSON.parse(localStorage.getItem("user"))
  const [orderNote, setOrderNote] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState("nhanh")
  const [orderId, setOrderId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Mock data cho địa chỉ
  const [cities] = useState([
    { code: "79", name: "TP. Hồ Chí Minh" },
    { code: "01", name: "Hà Nội" },
    { code: "48", name: "Đà Nẵng" },
  ])
  const [districts] = useState([
    { code: "760", name: "Quận 1" },
    { code: "761", name: "Quận 2" },
    { code: "762", name: "Quận 3" },
    { code: "763", name: "Quận 4" },
    { code: "764", name: "Quận 5" },
    { code: "765", name: "Quận 7" },
    { code: "766", name: "Quận 8" },
  ])
  const [wards] = useState([
    { code: "26734", name: "Phường 1" },
    { code: "26735", name: "Phường 2" },
    { code: "26736", name: "Phường 3" },
    { code: "26737", name: "Phường 4" },
  ])

  // Khởi tạo dữ liệu từ Cart
useEffect(() => {
//   if (location.state && location.state.selectedItems) {
//     setCartItems(location.state.selectedItems)
//   } else {
    const testItem = {
      product_id: "6886334c4400bc0b50d4593d",
      variant_id: "6886334c4400bc0b50d45949",
      option_id:  "6886334c4400bc0b50d4594d",
      name: "Giày Cầu Lông Taro TR024-1",
      sku_code: "TR024-1-WHT-36",
      variant: "Trắng xanh",
      size: "36",
      quantity: 25,
      price: 499000,
      thumbnail_url: "https://res.cloudinary.com/dwex11tdu/image/upload/v1751559915/maxdhq9vdqrg1ogvm30v.webp"
    }
    setCartItems([testItem])
    // navigate("/cart") 
//   }
}, [location.state])

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Toast notification
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Cập nhật địa chỉ đầy đủ
  useEffect(() => {
    const { houseNumber, ward, district, city } = shippingInfo
    const components = [houseNumber, ward, district, city].filter(Boolean)
    const fullAddress = components.join(", ")

    if (shippingInfo.address !== fullAddress) {
      setShippingInfo((prev) => ({ ...prev, address: fullAddress }))
    }
  }, [shippingInfo])

  const handleInputChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const validateShippingInfo = () => {
    const errors = []
    if (!shippingInfo.fullName.trim()) errors.push("Họ và tên không được để trống")
    if (!shippingInfo.phone.trim()) errors.push("Số điện thoại không được để trống")
    if (!shippingInfo.email.trim()) errors.push("Email không được để trống")
    if (!shippingInfo.houseNumber.trim()) errors.push("Số nhà, tên đường không được để trống")
    if (!shippingInfo.city) errors.push("Vui lòng chọn tỉnh/thành phố")
    if (!shippingInfo.district) errors.push("Vui lòng chọn quận/huyện")
    if (!shippingInfo.ward) errors.push("Vui lòng chọn phường/xã")

    if (errors.length > 0) {
      showToastMessage(errors[0])
      return false
    }
    return true
  }

  const handlePlaceOrder = async () => {
  setIsLoading(true)

  try {
    const userId = user?.id

    if (!userId) {
      showToastMessage("Bạn cần đăng nhập để đặt hàng")
      return
    }

    // Kiểm tra dữ liệu bắt buộc
    if (!shippingInfo.phone || !shippingInfo.address) {
      showToastMessage("Vui lòng nhập đầy đủ thông tin giao hàng")
      return
    }

    const orderData = {
      userId: userId,
      items: cartItems.map(item => ({
        product_id: item.product_id,             // Bắt buộc
        variant_id: item.variant_id,             // Bắt buộc
        option_id: item.option_id,               // Bắt buộc

        // Các trường hiển thị
        name: item.name,
        variant_name: item.variant || "Mặc định",
        sku_code: item.sku_code,
        size: item.size || "",
        quantity: item.quantity,
        price: item.price,
        list_price: item.list_price || item.price,
        thumbnail_url: item.thumbnail_url || item.image || ""
      })),
      totalAmount: totalAmount,
      shippingInfo: {
        phone: shippingInfo.phone,
        address: shippingInfo.address
      },
      orderNote: orderNote,
      deliveryMethod: deliveryMethod
    }

    const response = await fetch('http://localhost:4000/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    const data = await response.json()

    if (response.ok) {
      setOrderId(data.orderId)
      setCurrentStep("tracking")
      showToastMessage("Đặt hàng thành công")
    } else {
      console.error("Lỗi từ backend:", data)
      showToastMessage(data.message || "Có lỗi xảy ra khi đặt hàng")
    }

  } catch (error) {
    console.error('Lỗi gửi đơn hàng:', error)
    showToastMessage("Có lỗi xảy ra, vui lòng thử lại")
  } finally {
    setIsLoading(false)
  }
}



  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    showToastMessage("Đã sao chép mã đơn hàng")
  }

  const closeModal = () => {
    setCurrentStep("cart")
  }

  const goBackToCart = () => {
    navigate("/cart")
  }

  if (cartItems.length === 0) {
    return (
      <div className="purchase-page">
        <div className="container">
          <div className="empty-purchase">
            <h2>Không có sản phẩm nào được chọn</h2>
            <p>Vui lòng quay lại giỏ hàng và chọn sản phẩm</p>
            <button className="btn btn-primary" onClick={goBackToCart}>
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="purchase-page">
      {/* Toast Notification */}
      {showToast && <div className="toast">{toastMessage}</div>}

      <div className="container">

        {/* Danh sách sản phẩm đã chọn */}
        <div className="card">
          <div className="card-header">
            <h2>Sản phẩm đã chọn ({cartItems.length} sản phẩm)</h2>
          </div>
          <div className="card-content">
            <div className="product-list">
              {cartItems.map((item) => (
                <div key={item.id} className="product-item">
                  <div className="item-image-container">
                    <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="item-image" />
                  </div>
                  <div className="product-details">
                    <h3>{item.name}</h3>
                    <p className="variant">{item.variant}</p>
                    <p className="quantity">Số lượng: {item.quantity}</p>
                    <p className="unit-price">Đơn giá: {item.price.toLocaleString("vi-VN")}đ</p>
                  </div>
                  <div className="product-price">
                    <p>{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-section">
              <div className="total-amount">
                <span>Tổng tiền:</span>
                <span className="total-price">{totalAmount.toLocaleString("vi-VN")} VNĐ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={goBackToCart}>
            <span>←</span> Quay lại giỏ hàng
          </button>
          <button className="btn btn-primary" onClick={() => setCurrentStep("shipping")}>
            Tiến hành mua hàng
          </button>
        </div>

        {/* Modal thông tin vận chuyển */}
        {currentStep === "shipping" && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thông tin vận chuyển</h2>
                <button className="close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullName">Họ tên người nhận *</label>
                      <input
                        type="text"
                        id="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại *</label>
                      <input
                        type="tel"
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="form-row address-row">
                    <div className="form-group">
                      <label htmlFor="city">Tỉnh/Thành phố *</label>
                      <select
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {cities.map((city) => (
                          <option key={city.code} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="district">Quận/Huyện *</label>
                      <select
                        id="district"
                        value={shippingInfo.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.name}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="ward">Phường/Xã *</label>
                      <select
                        id="ward"
                        value={shippingInfo.ward}
                        onChange={(e) => handleInputChange("ward", e.target.value)}
                      >
                        <option value="">Chọn phường/xã</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.name}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="houseNumber">Số nhà, tên đường *</label>
                    <input
                      type="text"
                      id="houseNumber"
                      value={shippingInfo.houseNumber}
                      onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                      placeholder="Nhập số nhà, tên đường"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="note">Ghi chú (tùy chọn)</label>
                    <textarea
                      id="note"
                      value={shippingInfo.note}
                      onChange={(e) => handleInputChange("note", e.target.value)}
                      placeholder="Ghi chú thêm về địa chỉ giao hàng..."
                      rows="3"
                    />
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="saveInfo"
                      checked={shippingInfo.saveInfo}
                      onChange={(e) => handleInputChange("saveInfo", e.target.checked)}
                    />
                    <label htmlFor="saveInfo">Lưu thông tin cho lần sau</label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={closeModal}>
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (validateShippingInfo()) {
                        setCurrentStep("confirm")
                      }
                    }}
                  >
                    Xác nhận thông tin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận đơn hàng */}
        {currentStep === "confirm" && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Xác nhận đơn hàng</h2>
                <button className="close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Thông tin người nhận */}
                <div className="info-card">
                  <h3>Thông tin người nhận</h3>
                  <div className="info-content">
                    <p>
                      <strong>{shippingInfo.fullName}</strong> - {shippingInfo.phone}
                    </p>
                    <p className="text-gray">{shippingInfo.email}</p>
                    <p className="text-gray">{shippingInfo.address}</p>
                  </div>
                </div>

                {/* Sản phẩm */}
                <div className="info-card">
                  <h3>Sản phẩm đặt hàng</h3>
                  <div className="product-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="product-item small">
                        <div className="item-image-container">
                            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="item-image" />
                        </div>
                        <div className="product-details">
                          <h4>{item.name}</h4>
                          <p className="variant">{item.variant}</p>
                          <p className="quantity">x{item.quantity}</p>
                        </div>
                        <p className="product-price">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ghi chú và mã giảm giá */}
                <div className="form-group">
                  <label htmlFor="orderNote">Lời nhắn cho SCD</label>
                  <textarea
                    id="orderNote"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Ghi chú đơn hàng..."
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="discountCode">Mã giảm giá</label>
                  <input
                    type="text"
                    id="discountCode"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                </div>

                {/* Phương thức nhận hàng */}
                <div className="info-card">
                  <h3>Phương thức nhận hàng</h3>
                  <div className="delivery-options">
                    {[
                      { value: "nhanh", label: "Nhanh: Đảm bảo nhận hàng 3-5 ngày" },
                      { value: "sieu-toc", label: "Siêu tốc: Nhận hàng ngay ngày mai" },
                      { value: "tai-cua-hang", label: "Đến lấy tại cửa hàng" },
                    ].map((method) => (
                      <div
                        key={method.value}
                        className={`delivery-option ${deliveryMethod === method.value ? "selected" : ""}`}
                        onClick={() => setDeliveryMethod(method.value)}
                      >
                        <div className="radio-button">
                          <div className={`radio-inner ${deliveryMethod === method.value ? "selected" : ""}`}></div>
                        </div>
                        <span>{method.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="total-section">
                  <div className="total-amount">
                    <span>Tổng tiền:</span>
                    <span className="total-price">{totalAmount.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setCurrentStep("shipping")}>
                    Quay lại
                  </button>
                  <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Đặt hàng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal theo dõi đơn hàng */}
        {currentStep === "tracking" && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Theo dõi đơn hàng</h2>
                <button className="close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Thông tin giao hàng */}
                <div className="tracking-card">
                  <h3>
                    Thời gian đảm bảo nhận hàng: <strong>9 Th07 - 10 Th07</strong>
                  </h3>
                  <p className="status-subtitle">Đơn hàng đã xác nhận và chờ chuyển sang đơn vị vận chuyển</p>

                  <div className="tracking-info">
                    <div className="info-box">
                      <h4>Thông tin vận chuyển:</h4>
                      <div className="shipping-method">
                        <span>Chuyển phát nhanh</span>
                      </div>
                    </div>

                    <div className="info-box">
                      <h4>Thông tin nhận hàng:</h4>
                      <div className="address-info">
                        <div>
                          <p>
                            <strong>{shippingInfo.fullName}</strong> {shippingInfo.phone}
                          </p>
                          <p className="text-gray">{shippingInfo.address}</p>
                        </div>
                        <button className="btn btn-outline btn-small">Cập nhật</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mã đơn hàng */}
                <div className="order-id-section">
                  <span>
                    Mã đơn hàng: <strong>{orderId}</strong>
                  </span>
                  <button className="btn btn-outline btn-small" onClick={copyOrderId}>
                    Sao chép
                  </button>
                </div>

                {/* Sản phẩm */}
                <div className="product-list">
                    {cartItems.map((item) => (
                        <div key={item.id} className="product-item small">
                        <div className="item-image-container">
                            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="item-image" />
                        </div>

                        <div className="product-info">
                            <div className="product-details">
                            <h4>{item.name}</h4>
                            <p className="variant">{item.variant}</p>
                            <p className="quantity">x{item.quantity}</p>
                            </div>
                            <p className="product-price">
                            {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                            </p>
                        </div>
                        </div>
                    ))}
                </div>


                {/* Tổng tiền */}
                <div className="total-section">
                  <div className="total-amount">
                    <span>Tổng tiền:</span>
                    <span className="total-price red">{totalAmount.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="modal-actions">
                  <button className="btn btn-outline">Hủy đơn hàng</button>
                  <button className="btn btn-primary" onClick={() => navigate("/cart")}>
                    Quay lại giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchasePage
