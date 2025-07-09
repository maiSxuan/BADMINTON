import React, { useState, useEffect } from 'react';
import './OrderHistory.css';

const mockOrders = [
    {
      _id: 'ORDER004',
      status: 'Chờ xác nhận',
      totalPrice: 280000,
      items: [
        {
          _id: 'p1-confirm',
          name: 'Vợt cầu lông Yonex Nanoflare 700pro',
          variant: 'Phân loại hàng: 4U5',
          price: 280000,
          quantity: 1,
          imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp'
        }
      ]
    },
    {
      _id: 'ORDER001',
      status: 'Giao hàng thành công', 
      totalPrice: 280000,
      items: [
        {
          _id: 'p1',
          name: 'Vợt cầu lông Yonex Nanoflare 700pro',
          variant: 'Phân loại hàng: 4U5',
          price: 280000,
          quantity: 1,
          imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp'
        }
      ]
    },
    {
      _id: 'ORDER002',
      status: 'Đã hủy',
      totalPrice: 560000,
      items: [
        {
          _id: 'p2',
          name: 'Vợt cầu lông Yonex Nanoflare 700pro',
          variant: 'Phân loại hàng: 4U5 xanh',
          price: 280000,
          quantity: 1,
          imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp'
        },
        {
          _id: 'p3',
          name: 'Vợt cầu lông Yonex Nanoflare 700pro',
          variant: 'Phân loại hàng: 4U5',
          price: 280000,
          quantity: 1,
          imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp'
        }
      ]
    },
    {
      _id: 'ORDER003',
      status: 'Chờ giao hàng', 
      totalPrice: 560000,
      items: [
        {
          _id: 'p4',
          name: 'Vợt cầu lông Yonex Nanoflare 700pro',
          variant: 'Phân loại hàng: 4U5',
          price: 280000,
          quantity: 1,
          imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp'
        },
        {
          _id: 'p5',
          name: 'Vợt cầu lông Yonex Nanoflare 700pro',
          variant: 'Phân loại hàng: 4U5',
          price: 280000,
          quantity: 1,
          imageUrl: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1701765095.webp'
        }
      ]
    }
];


const OrderHistoryPage = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        const sortedOrders = mockOrders.sort((a, b) => {
            const order = ['Chờ xác nhận', 'Hoàn thành', 'Đã hủy', 'Chờ giao hàng'];
            return order.indexOf(a.status) - order.indexOf(b.status);
        });
        setOrders(sortedOrders);
    }, []);

    useEffect(() => {
        if (activeTab === 'Tất cả') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === activeTab));
        }
    }, [activeTab, orders]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'decimal', currency: 'VND' }).format(amount) + 'đ';

    const tabs = ['Tất cả', 'Chờ xác nhận', 'Chờ thanh toán', 'Vận chuyển', 'Chờ giao hàng', 'Hoàn thành', 'Đã hủy', 'Trả hàng/Hoàn tiền'];

    return (
        <div className="order-history-container">
            {/* Tabs */}
            <div className="tabs-nav">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Danh sách đơn */}
            <div className="orders-list">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-status-header">
                                <span>{order.status}</span>
                            </div>
                            <div className="order-body">
                                {order.items.map(item => (
                                    <div key={item._id} className="order-item">
                                        <img src={item.imageUrl} alt={item.name} className="item-image" />
                                        <div className="item-details">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-variant">{item.variant}</p>
                                        </div>
                                        <span className="item-price">{formatCurrency(item.price)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Section đánh giá chỉ hiển thị khi đơn hàng hoàn thành */}
                            {order.status === 'Hoàn thành' && (
                                <div className="review-section">
                                    <span>Đánh giá sản phẩm</span>
                                    <button className="btn btn-red">Viết đánh giá</button>
                                </div>
                            )}

                            <div className="order-footer">
                                <div className="total-price-container">
                                    <span>Thành tiền:</span>
                                    <span className="total-price-amount">{formatCurrency(order.totalPrice)}</span>
                                </div>
                                <div className="order-actions">
                                    {order.status === 'Chờ xác nhận' && (
                                       <button className="btn btn-gray">Hủy đơn hàng</button>
                                    )}
                                    {order.status === 'Hoàn thành' && (
                                        <>
                                            <button className="btn btn-red">Mua lại</button>
                                            <button className="btn btn-gray">Xem chi tiết</button>
                                        </>
                                    )}
                                     {order.status === 'Chờ giao hàng' && (
                                        <button className="btn btn-red">Đã nhận được hàng</button>
                                    )}
                                    {order.status === 'Đã hủy' && (
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
        </div>
    );
};

export default OrderHistoryPage;