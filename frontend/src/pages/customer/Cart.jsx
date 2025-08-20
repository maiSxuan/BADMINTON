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
  const [editableQuantities, setEditableQuantities] = useState({});

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
          stock_quantity: item.stock_quantity || 999,
          price: item.price,
          selected: false,
          color: item.color || "Không xác định",
          size: item.size || "Không xác định",
          image: item.image || "/placeholder.svg"
        }));

        setCartItems(cartWithSelected);

        const initialQuantities = cartWithSelected.reduce((acc, item) => {
          acc[item._id] = item.quantity;
          return acc;
        }, {});
        setEditableQuantities(initialQuantities);

      } catch (err) {
        console.error('Lỗi khi tải giỏ hàng:', err)
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

  const handleUpdateItemQuantity = async (item, newQuantity) => {
    const originalQuantity = item.quantity;

    let validatedQuantity = parseInt(newQuantity, 10);
    if (isNaN(validatedQuantity) || validatedQuantity < 1) {
      validatedQuantity = 1;
    }
    if (validatedQuantity > item.stock_quantity) {
      validatedQuantity = item.stock_quantity;
      showPopup('Thông báo', `Số lượng sản phẩm vượt quá tồn kho. Tối đa: ${item.stock_quantity}`, null, null, 4, 3);
    }

    setEditableQuantities(prev => ({ ...prev, [item._id]: validatedQuantity }));

    if (validatedQuantity === originalQuantity) {
      return;
    }

    try {
      // THAY ĐỔI: Gửi 'quantity' thay vì 'delta'
      await updateCartItemQuantity(item.variantId, {
        product: item.productId,
        variant_id: item.variantId,
        option_id: item.optionId,
        quantity: validatedQuantity 
      });

      setCartItems(prev =>
        prev.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: validatedQuantity }
            : cartItem
        )
      );
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      showPopup('Lỗi', err.message || 'Cập nhật số lượng thất bại.', null, null, 4, 2);
      
      setEditableQuantities(prev => ({ ...prev, [item._id]: originalQuantity }));
    }
  };

  const handleQuantityInputChange = (e, item) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 3);
    setEditableQuantities(prev => ({
      ...prev,
      [item._id]: numericValue,
    }));
  };

  const handleQuantityKeyDown = (e, item) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleQuantityButtonClick = (item, amount) => {
    const currentQuantity = item.quantity;
    const newQuantity = currentQuantity + amount;
    if (newQuantity >= 1 && newQuantity <= item.stock_quantity) {
      handleUpdateItemQuantity(item, newQuantity);
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
          console.error("Lỗi khi xóa sản phẩm:", err)
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
          console.error("Lỗi xóa toàn bộ giỏ hàng: ", err);
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
                      onClick={() => handleQuantityButtonClick(item, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="quantity-input"
                      value={editableQuantities[item._id] || ''}
                      onChange={(e) => handleQuantityInputChange(e, item)}
                      onKeyDown={(e) => handleQuantityKeyDown(e, item)}
                      onBlur={() => handleUpdateItemQuantity(item, editableQuantities[item._id])}
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityButtonClick(item, 1)}
                      disabled={item.quantity >= item.stock_quantity}
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

export default CartPage;