"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Purchase.css"
import { createOrder } from "../../services/orderService"
import { removeItemFromCart } from "../../services/cartService"
import { provinces, districts, wards } from 'vietnam-provinces';
import { updateOrderStatus } from "../../services/orderService"
const PurchasePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedItems = location.state?.selectedItems || [];
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [wardList, setWardList] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  
  const handleAcceptCancellation = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        await updateOrderStatus(orderId, "Đã hủy")
        alert("Đã hủy đơn hàng thành công!")
      } catch (error) {
        alert("Có lỗi xảy ra khi hủy đơn hàng!")
      }
    }
  }

  useEffect(() => {
    setProvinceList(provinces);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const filteredDistricts = districts.filter(
        (d) => d.province_code === selectedProvince
      );
      setDistrictList(filteredDistricts);
      setSelectedDistrict('');
      setWardList([]);
      setSelectedWard('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      const filteredWards = wards.filter(
        (w) => w.district_code === selectedDistrict
      );
      setWardList(filteredWards);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    const selectedProvinceName = provinceList.find(p => p.code === selectedProvince)?.name || '';
    setShippingInfo(prev => ({ ...prev, city: selectedProvinceName }));
  }, [selectedProvince]);

  useEffect(() => {
    const selectedDistrictName = districtList.find(d => d.code === selectedDistrict)?.name || '';
    setShippingInfo(prev => ({ ...prev, district: selectedDistrictName }));
  }, [selectedDistrict]);

  useEffect(() => {
    const selectedWardName = wardList.find(w => w.code === selectedWard)?.name || '';
    setShippingInfo(prev => ({ ...prev, ward: selectedWardName }));
  }, [selectedWard]);

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

  // Khởi tạo dữ liệu từ Cart
  useEffect(() => {
      setCartItems(selectedItems)
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
    setIsLoading(true);

    try {
      const userId = user?.userID;

      if (!userId) {
        showToastMessage("Bạn cần đăng nhập để đặt hàng");
        return;
      }

      if (!shippingInfo.phone || !shippingInfo.address) {
        showToastMessage("Vui lòng nhập đầy đủ thông tin giao hàng");
        return;
      }

      const orderData = {
        userId: userId,
        shippingInfo: shippingInfo,
        items: selectedItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          option_id: item.option_id,
          quantity: item.quantity,
          priceAtTime: item.price
          })),
        totalAmount: totalAmount,
        orderNote: orderNote,
        deliveryMethod: deliveryMethod
      };

      const data = await createOrder(orderData);
      for (const item of selectedItems) {
        try {
          await removeItemFromCart(item.variant_id, {
            product: item.product_id,
            variant_id: item.variant_id,
            option_id: item.option_id
          })
        } catch (err) {
          console.error("Lỗi xóa item khỏi giỏ:", err.message);
        }
      }

      setOrderId(data.orderId);
      setCurrentStep("tracking");
      showToastMessage("Đặt hàng thành công");

    } catch (error) {
      console.error('Lỗi gửi đơn hàng:', error);
      showToastMessage(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

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
                  <div className="form-group">
            {/* Province */}
              <label htmlFor="province">Tỉnh/Thành phố</label>
              <select
                id="province"
                className="form-control"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinceList.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>

                {/* District */}
                <label htmlFor="district">Quận/Huyện</label>
                <select
                  id="district"
                  className="form-control"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedProvince}
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districtList.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>

                {/* Ward */}
                <label htmlFor="ward">Phường/Xã</label>
                <select
                  id="ward"
                  className="form-control"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  disabled={!selectedDistrict}
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wardList.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
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
                  <button className="btn btn-outline" onClick={handleAcceptCancellation(orderId)}>Hủy đơn hàng</button>
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
