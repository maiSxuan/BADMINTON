import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Cart.css"
import { fetchCart, updateCartItemQuantity, removeItemFromCart, clearAllCart, removeSelectedItemsFromCart } from "../../services/index"
import { usePopup } from "../../components/common/popupContext";

const CartPage = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(true)

  const { showPopup } = usePopup();

  useEffect(() => {
    const selectedItems = cartItems.filter((item) => item.selected)
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(total)
    setSelectedCount(selectedItems.length)
    setSelectAll(cartItems.length > 0 && selectedItems.length === cartItems.length)
  }, [cartItems])

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const data = await fetchCart();

        const cartWithSelected = data.items.map(item => ({
          _id: item._id,
          name: item.name || 'Không rõ tên',
          productId: item.productId,
          variantId: item.variantId,
          optionId: item.optionId,
          slug: item.slug,
          quantity: item.quantity,
          price: item.price,
          selected: false,
          color: item.color || "Không xác định",
          size: item.size || "Không xác định",
          image: item.image || "/placeholder.svg"
        }));

        setCartItems(cartWithSelected)
      } catch (err) {
        console.error('Failed to fetch cart:', err)
        showPopup(
          'Lỗi',
          err.message || 'Tải giỏ hàng thất bại',
          null,
          null,
          4,
          2
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCartData()
  }, [showPopup])

  const handleQuantityChange = async (item, amount) => {
    if (![1, -1].includes(amount)) return
    if (![1, -1].includes(amount)) return

    try {
      await updateCartItemQuantity(item.variantId, {
        product: item.productId,
        variant_id: item.variantId,
        option_id: item.optionId,
        delta: amount
      });

      setCartItems(prev =>
        prev.map(newItem =>
          newItem.productId === item.productId &&
            newItem.variantId === item.variantId &&
            newItem.optionId === item.optionId
            ? { ...newItem, quantity: newItem.quantity + amount }
            : newItem
        )
      )
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemoveItem = async (item) => {
    showPopup(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?',
      'Xóa',
      async () => {
        try {
          await removeItemFromCart(item.variantId, {
            product: item.productId,
            variant_id: item.variantId,
            option_id: item.optionId
          });

          setCartItems((prevItems) =>
            prevItems.filter(i =>
              !(i.productId === item.productId &&
                i.variantId === item.variantId &&
                i.optionId === item.optionId
              )
            )
          );

          window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
          console.error("Failed to remove item:", err)
        }
      },
      6
    )
  }

  const handleRemoveSelectedItem = async () => {
    const itemsToRemove = cartItems.filter(item => item.selected);

    if (itemsToRemove.length === 0) {
      showPopup(
        'Thông báo',
        'Bạn chưa chọn sản phẩm để xóa',
        null,
        null,
        4,
        2
      )
      return
    }

    showPopup(
      'Xác nhận xóa',
      'Bạn có chắc chắn xóa những sản phẩm được chọn khỏi giỏ hàng không?',
      'Xóa',
      async () => {
        try {
          await removeSelectedItemsFromCart(
            itemsToRemove.map(item => ({
              product: item.productId,
              variant_id: item.variantId,
              option_id: item.optionId
            }))
          );

          setCartItems(prevItems =>
            prevItems.filter(item =>
              !itemsToRemove.some(toRemove =>
                toRemove.productId === item.productId &&
                toRemove.variantId === item.variantId &&
                toRemove.optionId === item.optionId
              )
            ).map(item => ({ ...item, selected: false }))
          );

          setSelectAll(false);
          window.dispatchEvent(new Event("cartUpdated"));
          showPopup(
            'Thông báo',
            'Xóa các sản phẩm đã chọn thành công',
            null,
            null,
            4,
            2
          )
        } catch (err) {
          console.error("Lỗi khi xóa các sản phẩm được chọn: ", err);
          showPopup(
            'Lỗi',
            err.message || 'Xóa các sản phẩm đã chọn thất bại',
            null,
            null,
            4,
            2
          )
        }
      },
      6
    )
  };

  const handleClearCart = async () => {
    showPopup(
      'Xác nhận xóa',
      'Bạn có chắc chắn xóa toàn bộ giỏ hàng không?',
      'Xóa',
      async () => {
        try {
          await clearAllCart();
          setCartItems([]);
          window.dispatchEvent(new Event("cartUpdated"));
          showPopup(
            'Thông báo',
            'Đã xóa toàn bộ giỏ hàng',
            null,
            null,
            4,
            2
          )
        } catch (err) {
          console.error("Clear cart error: ", err);
          showPopup(
            'Lỗi',
            err.message || 'Xóa toàn bộ sản phẩm trong giỏ hàng thất bại',
            null,
            null,
            4,
            2
          )
        }
      },
      6
    )
  }

  const handleSelectItem = (item) => {
    setCartItems(prev =>
      prev.map(i =>
        i._id === item._id ? { ...i, selected: !i.selected } : i
      )
    )
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setCartItems(prev => prev.map(i => ({ ...i, selected: newSelectAll })))
  }

  const handleProceedToPurchase = () => {
    const selectedItems = cartItems.filter(i => i.selected)
    if (selectedItems.length === 0) {
      // alert("Vui lòng chọn ít nhất một sản phẩm để mua hàng!")
      showPopup(
        'Thông báo',
        'Vui lòng chọn ít nhất một sản phẩm để mua hàng',
        null,
        null,
        4,
        3
      )
      return
    }

    const mappedItems = selectedItems.map(item => ({
      _id: item._id,
      name: item.name || 'Không rõ tên',
      productId: item.productId,
      variantId: item.variantId,
      optionId: item.optionId,
      quantity: item.quantity,
      price: item.price,
      selected: false,
      color: item.color || "Không xác định",
      size: item.size || "Không xác định",
      image: item.image || "/placeholder.svg"
    }));

    navigate("/purchase", {
      state: { selectedItems: mappedItems }
    })
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  function LoadingSpinner() {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }
  if (loading) return <LoadingSpinner />;

  return (
    <div className="cart-page-container">
      <div className="cart-content-wrapper">
        <div className="cart-header">
          <h1 className="cart-title">GIỎ HÀNG CỦA BẠN</h1>
          <p className="cart-subtitle">({cartItems.length} sản phẩm)</p>
        </div>

        {cartItems.length > 0 ? (
          <>
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

              <div className="cart-remove-button-section">
                <button onClick={handleRemoveSelectedItem} className="clear-cart-btn">
                  Xoá tất cả đã chọn
                </button>

                <button onClick={handleClearCart} className="clear-cart-btn">
                  Xoá tất cả
                </button>
              </div>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className={`cart-item ${item.selected ? "selected" : ""}`}>
                  <div className="item-select">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleSelectItem(item)}
                      className="select-checkbox"
                    />
                  </div>

                  <Link to={`/products/${item.slug}`} key={item._id} className={`cart-item-link`}>
                    <div className="item-image-container">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="item-image" />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-variant">{item.color} - {item.size}</p>
                      <p className="item-unit-price">Đơn giá: {formatCurrency(item.price)}</p>
                    </div>
                  </Link>

                  <div className="item-quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input type="text" value={item.quantity} readOnly className="quantity-input" />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-price-section">
                    <p className="item-total-price">{formatCurrency(item.price * item.quantity)}</p>
                  </div>

                  <button className="item-remove-btn" onClick={() => handleRemoveItem(item)} title="Xóa sản phẩm">
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