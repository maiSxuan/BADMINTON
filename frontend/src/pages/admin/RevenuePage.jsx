import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import dashboardService from '../../services/dashboardService';
import './RevenuePage.css';

// Hàm trợ giúp
const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Định nghĩa màu cho các trạng thái đơn hàng
const STATUS_COLORS = {
  'Chờ xác nhận': '#ffc107', // Vàng
  'Đang xử lý': '#17a2b8',    // Xanh dương
  'Hoàn thành': '#28a745',   // Xanh lá
  'Đã hủy': '#dc3545',       // Đỏ
  'Default': '#6c757d'        // Xám cho các trạng thái khác
};

const RevenuePage = () => {
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiRevenue, setApiRevenue] = useState([]); 
  const [orderStats, setOrderStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sử dụng Promise.allSettled để tất cả các API đều chạy xong
        const results = await Promise.allSettled([
          dashboardService.getRevenueStatistics('monthly'),
          dashboardService.getOrderStatistics(),
          dashboardService.getTopSellingProducts(5),
          dashboardService.getLowStockAlerts(10) 
        ]);

        // Gỡ lỗi: In kết quả ra để xem trạng thái của từng API
        console.log('API Results:', results);

        // Xử lý kết quả của từng API một cách độc lập
        // 1. Doanh thu
        if (results[0].status === 'fulfilled' && results[0].value.success) {
          setApiRevenue(results[0].value.data);
        } else if (results[0].status === 'rejected') {
          console.error('Lỗi API Doanh thu:', results[0].reason);
        }

        // 2. Thống kê đơn hàng
        if (results[1].status === 'fulfilled' && results[1].value.success) {
          setOrderStats(results[1].value);
        } else if (results[1].status === 'rejected') {
          console.error('Lỗi API Thống kê đơn hàng:', results[1].reason);
        }

        // 3. Sản phẩm bán chạy
        if (results[2].status === 'fulfilled' && results[2].value.success) {
          setTopProducts(results[2].value.data);
        } else if (results[2].status === 'rejected') {
          console.error('Lỗi API Sản phẩm bán chạy:', results[2].reason);
        }

        // 4. Sản phẩm sắp hết hàng
        if (results[3].status === 'fulfilled' && results[3].value.success) {
          setLowStockProducts(results[3].value.data);
        } else if (results[3].status === 'rejected') {
          console.error('Lỗi API Sản phẩm sắp hết hàng:', results[3].reason);
        }

      } catch (err) {
        // Khối catch này giờ ít khả năng xảy ra hơn, trừ khi có lỗi cú pháp
        setError('Đã có lỗi xảy ra trong quá trình tải dữ liệu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DERIVED DATA & LOGIC ---

  const last6MonthsRevenue = useMemo(() => {
    const revenueMap = new Map(apiRevenue.map(item => [`${item._id.year}-${item._id.month}`, item.totalRevenue]));
    const result = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      result.push({
        month: `T${date.getMonth() + 1}`,
        'Doanh thu': revenueMap.get(key) || 0,
      });
    }
    return result;
  }, [apiRevenue]);

  const totalLast6MonthsRevenue = last6MonthsRevenue.reduce((sum, item) => sum + item['Doanh thu'], 0);

  // ** MỚI: Dữ liệu cho biểu đồ trạng thái đơn hàng **
  const orderStatusData = useMemo(() => {
    if (!orderStats?.statusCounts) return [];
    return orderStats.statusCounts.map(item => ({
      name: item.status,
      value: item.count,
    }));
  }, [orderStats]);

  // ** MỚI: Dữ liệu cho thẻ "Doanh thu tháng này" **
  const thisMonthRevenue = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const monthData = apiRevenue.find(item => item._id.year === currentYear && item._id.month === currentMonth);
    return monthData?.totalRevenue || 0;
  }, [apiRevenue]);


  // --- RENDER LOGIC ---
  if (loading) return <div className="revenue-page">Đang tải dữ liệu...</div>;
  if (error) return <div className="revenue-page" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="revenue-page">
      <div className="dashboard-grid">
        
        {/* Hàng 1, Cột 1: Biểu đồ doanh thu */}
        <div className="card revenue-chart-card">
            <div className="chart-header">
                <div>
                    <p className="chart-title">Tổng doanh thu (6 tháng gần nhất)</p>
                    <p className="chart-value">{formatCurrency(totalLast6MonthsRevenue)}</p>
                </div>
                <select className="time-filter"><option>6 THÁNG</option></select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={last6MonthsRevenue} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    <Tooltip cursor={{fill: 'rgba(233, 30, 99, 0.1)'}} formatter={(value) => formatCurrency(value)}/>
                    <Bar dataKey="Doanh thu" fill="#E91E63" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* ** MỚI: Hàng 1, Cột 2: Biểu đồ trạng thái đơn hàng ** */}
        <div className="card order-status-card">
            <h3 className="card-title">Trạng thái đơn hàng</h3>
            <div className="pie-chart-wrapper">
                <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                        <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                            {orderStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Default} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} đơn`, name]} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="custom-legend">
                    {orderStatusData.map((entry, index) => (
                        <div key={`legend-${index}`} className="legend-item">
                            <span className="legend-color-box" style={{ backgroundColor: STATUS_COLORS[entry.name] || STATUS_COLORS.Default }}></span>
                            <div className="legend-label">
                                <span className="name">{entry.name}</span>
                                <span className="value">{entry.value.toLocaleString()} đơn</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ** MỚI: Hàng 2: Container cho các thẻ thống kê ** */}
        <div className="stats-container">
            <div className="card stat-card stat-card-purple">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                    <p className="stat-title">Doanh thu tháng này</p>
                    <p className="stat-value">{formatCurrency(thisMonthRevenue)}</p>
                </div>
            </div>
            {/* Bạn có thể thêm các thẻ thống kê khác vào đây nếu muốn */}
        </div>


        {/* Hàng 3: Bảng sản phẩm bán chạy */}
 <div className="tables-container">
          {/* Bảng sản phẩm bán chạy */}
          <div className="card best-selling-card">
              <h3 className="card-title">Sản phẩm bán chạy</h3>
              <table className="best-selling-table">
                  <thead>
                      <tr>
                          <th>Sản phẩm</th>
                          <th>Đã bán</th>
                          <th>Doanh thu</th>
                      </tr>
                  </thead>
                  <tbody>
                      {topProducts.map((product, index) => (
                          <tr key={product.sku || index}>
                              <td>
                                  <div className="product-cell">
                                      <img src={product.thumbnail || 'https://via.placeholder.com/40'} alt={product.name}/>
                                      <div>
                                          <p className="product-name">{product.name}</p>
                                          <p className="product-sub">SKU: {product.sku}</p>
                                      </div>
                                  </div>
                              </td>
                              <td>{product.totalQuantitySold}</td>
                              <td>{formatCurrency(product.totalRevenue)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* --- KHỐI JSX MỚI: Bảng sản phẩm sắp hết hàng --- */}
          <div className="card low-stock-card">
              <h3 className="card-title">Sản phẩm sắp hết hàng</h3>
              <table className="best-selling-table"> {/* Tái sử dụng class CSS cho bảng */}
                  <thead>
                      <tr>
                          <th>Sản phẩm</th>
                          <th>Phân loại</th>
                          <th>Số lượng</th>
                      </tr>
                  </thead>
                  <tbody>
                      {lowStockProducts.map((item, index) => (
                          <tr key={item.sku || index}>
                              <td>
                                {/* Không có ảnh nên chỉ hiển thị tên */}
                                <p className="product-name">{item.productName}</p>
                                <p className="product-sub">SKU: {item.sku}</p>
                              </td>
                              <td>{`${item.variantName} - ${item.optionValue}`}</td>
                              <td>
                                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                  {item.stock}
                                </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>
    </div>
    </div>
  );
};

export default RevenuePage;