import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; 
import './Cart.css'; 

const initialCartItems = [
    { id: 'nf700pro-4u5', name: 'Vợt cầu lông Yonex Nanoflare 700pro', variantInfo: 'Size: 4U5', price: 1111000, quantity: 2, imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp' },
    { id: 'vic-a960-red-42', name: 'Giày cầu lông Victor A960', variantInfo: 'Màu: Đỏ, Size: 42', price: 950000, quantity: 1, imageUrl: 'https://shopvnb.com/uploads/gallery/giay-cau-long-victor-a960-do-chinh-hang_1634714652.webp' },
    { id: 'lining-ax-black-3u', name: 'Vợt cầu lông Lining Axforce 90', variantInfo: 'Màu: Đen, Size: 3U', price: 1500000, quantity: 1, imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-lining-axforce-90-max-xanh-dragon-chinh-hang_1699928509.webp' },
];

const CartPage = () => {
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(total);
    }, [cartItems]);

    const handleQuantityChange = (itemId, amount) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + amount;

                    return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
                }
                return item;
            }).filter(item => item.quantity > 0) // Có thể thêm filter để xóa item nếu quantity = 0
        );
    };

    // Hàm xóa sản phẩm
    const handleRemoveItem = (itemId) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        }
    };
    
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="cart-page-container"> 
            <div className="cart-content-wrapper">
                <h1 className="cart-title">GIỎ HÀNG CỦA BẠN</h1>

                {cartItems.length > 0 ? (
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.imageUrl} alt={item.name} className="item-image" />
                                <div className="item-details">
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-variant">{item.variantInfo}</p>
                                </div>
                                <div className="item-quantity-control">
                                    <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                    <input type="text" value={item.quantity} readOnly />
                                    <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                                </div>
                                <p className="item-price">{formatCurrency(item.price * item.quantity)}</p>
                                <button className="item-remove-btn" onClick={() => handleRemoveItem(item.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-cart-message">
                        <p>Giỏ hàng của bạn đang trống.</p>
                        <Link to="/products" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
                    </div>
                )}
                
                {cartItems.length > 0 && (
                    <div className="cart-summary">
                        <div className="total-price-section">
                            <span className="total-label">Tổng tiền:</span>
                            <span className="total-value">{formatCurrency(totalPrice)}</span>
                        </div>
                        <button className="checkout-btn">Đặt hàng</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;