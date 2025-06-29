import React, { useState, useEffect } from 'react';
import './BalancePage.css'; // File CSS sẽ được tạo ở dưới
import { ArrowDownToLine, Landmark } from 'lucide-react'; // Ví dụ dùng icon

// --- DỮ LIỆU TẠM THỜI (MOCK DATA) ---
const mockBalanceData = {
    currentBalance: 50273000,
    totalIncome: 120500000,
    totalPayout: 70227000,
};

const mockTransactions = [
    { id: 'txn_1', type: 'Doanh thu bán hàng', date: '2023-10-27T10:30:00Z', amount: 1500000, status: 'Hoàn thành' },
    { id: 'txn_2', type: 'Rút tiền', date: '2023-10-26T15:00:00Z', amount: -5000000, status: 'Hoàn thành' },
    { id: 'txn_3', type: 'Phí dịch vụ', date: '2023-10-25T12:00:00Z', amount: -50000, status: 'Hoàn thành' },
    { id: 'txn_4', type: 'Doanh thu bán hàng', date: '2023-10-25T09:15:00Z', amount: 850000, status: 'Hoàn thành' },
    { id: 'txn_5', type: 'Hoàn tiền đơn hàng #123', date: '2023-10-24T11:00:00Z', amount: -250000, status: 'Hoàn thành' },
    { id: 'txn_6', type: 'Rút tiền', date: '2023-10-23T18:00:00Z', amount: -10000000, status: 'Đang xử lý' },
    { id: 'txn_7', type: 'Doanh thu bán hàng', date: '2023-10-22T14:45:00Z', amount: 3200000, status: 'Thất bại' },
];

// --- COMPONENT CHÍNH ---
const BalancePage = () => {
    const [balance, setBalance] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập việc gọi API
        const fetchData = () => {
            setLoading(true);
            setTimeout(() => {
                setBalance(mockBalanceData);
                setTransactions(mockTransactions);
                setLoading(false);
            }, 1000); // Giả lập độ trễ 1 giây
        };
        fetchData();
    }, []);

    // Hàm helper để định dạng số tiền
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return <div className="loading-state">Đang tải dữ liệu tài chính...</div>;
    }

    return (
        <div className="balance-page-container">
            {/* --- TIÊU ĐỀ VÀ NÚT HÀNH ĐỘNG --- */}
            <div className="page-header">
                <h1>Số Dư Tài Khoản</h1>
                <div className="action-buttons">
                    <button className="btn btn-secondary"><ArrowDownToLine size={16} /> Báo Cáo</button>
                    <button className="btn btn-primary"><Landmark size={16} /> Yêu Cầu Thanh Toán</button>
                </div>
            </div>

            {/* --- CÁC THẺ THỐNG KÊ TỔNG QUAN --- */}
            <div className="summary-cards">
                <div className="stat-card">
                    <p className="stat-title">Số Dư Hiện Tại</p>
                    <p className="stat-value main-balance">{formatCurrency(balance.currentBalance)}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Tổng Thu Nhập</p>
                    <p className="stat-value">{formatCurrency(balance.totalIncome)}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Tổng Chi</p>
                    <p className="stat-value">{formatCurrency(balance.totalPayout)}</p>
                </div>
            </div>
            
            {/* --- BẢNG LỊCH SỬ GIAO DỊCH --- */}
            <div className="transaction-history">
                <h2>Lịch sử giao dịch</h2>
                <div className="table-wrapper">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Loại giao dịch</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Mô tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{new Date(tx.date).toLocaleString('vi-VN')}</td>
                                    <td>{tx.type}</td>
                                    <td className={tx.amount > 0 ? 'amount-income' : 'amount-outcome'}>
                                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${tx.status.toLowerCase().replace(' ', '-')}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td>{tx.id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BalancePage;