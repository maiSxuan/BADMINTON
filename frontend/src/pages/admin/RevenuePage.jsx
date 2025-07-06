import './RevenuePage.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
  { month: 'T1', 'Năm nay': 1800, 'Năm trước': 1600 },
  { month: 'T2', 'Năm nay': 2200, 'Năm trước': 2000 },
  { month: 'T3', 'Năm nay': 2800, 'Năm trước': 2500 },
  { month: 'T4', 'Năm nay': 2400, 'Năm trước': 2200 },
  { month: 'T5', 'Năm nay': 3100, 'Năm trước': 2800 },
  { month: 'T6', 'Năm nay': 2900, 'Năm trước': 2600 },
  { month: 'T7', 'Năm nay': 2500, 'Năm trước': 2300 },
  { month: 'T8', 'Năm nay': 2700, 'Năm trước': 2500 },
  { month: 'T9', 'Năm nay': 2800, 'Năm trước': 2600 },
  { month: 'T10', 'Năm nay': 2200, 'Năm trước': 2000 },
  { month: 'T11', 'Năm nay': 1800, 'Năm trước': 1600 },
  { month: 'T12', 'Năm nay': 1500, 'Năm trước': 1300 },
];

const deliveryData = [
  { name: 'Thành công', value: 15, color: '#E91E63' },
  { name: 'Thất bại', value: 85, color: '#F8BBD0' },
];

const statsData = [
    { title: "Khách truy cập", value: "10.8m", icon: "👤", color: "orange" },
    { title: "Đơn hàng", value: "100,345", icon: "🛒", color: "blue" },
    { title: "Doanh số", value: "$200k", icon: "💰", color: "green" },
    { title: "Đơn hàng thành công", value: "98,771", icon: "📦", color: "pink" },
];

const bestSellingProducts = [
    { id: 1, img: 'https://via.placeholder.com/40', name: 'Samsung S20 128 GB', sub: 'Pink - 50 orders', inventory: 700, sale: '$1,000.60', price: '$1,300.92', today: '$17,000.92'},
    { id: 2, img: 'https://via.placeholder.com/40', name: 'Samsung S21 256 GB', sub: 'Black - 25 orders', inventory: 200, sale: '$1,200.60', price: '$1,500.92', today: '$12,000.82'},
];

const RevenuePage = () => {
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, axisLine: false, tickLine: false },
      y: { ticks: { display: false }, grid: { display: false }, border: { display: false } },
    },
  };

  return (
    <div className="revenue-page">
      <div className="dashboard-grid">
        
        <div className="card revenue-chart-card">
            <div className="chart-header">
                <div>
                    <p className="chart-title">Tổng doanh thu</p>
                    <p className="chart-value">$980,273.00</p>
                </div>
                <select className="time-filter"><option>NĂM</option></select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData} margin={{ top: 20, right: 0, left: -30, bottom: 5 }} barGap={10} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'rgba(233, 30, 99, 0.1)'}}/>
                    <Bar dataKey="Năm trước" fill="#F8BBD0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Năm nay" fill="#E91E63" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="card delivery-status-card">
            <div className="chart-header"><p className="chart-title">Tháng 6</p></div>
            <div className="pie-chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={deliveryData} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={90} startAngle={90} endAngle={450}>
                            {deliveryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="pie-chart-center-text">
                    <div className="percentage">+15%</div>
                    <div className="description">Giao hàng thành công</div>
                </div>
            </div>
            <div className="custom-legend">
                {deliveryData.map((entry) => (
                    <div key={entry.name} className="legend-item">
                        <span className="legend-color-box" style={{ backgroundColor: entry.color }}></span>
                        <span>{entry.name}</span>
                        <span className="legend-value">{entry.value}%</span>
                    </div>
                ))}
            </div>
        </div>

        {statsData.map((stat, index) => (
            <div key={index} className={`card stat-card stat-card-${stat.color}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-info">
                    <p className="stat-title">{stat.title}</p>
                    <p className="stat-value">{stat.value}</p>
                </div>
            </div>
        ))}
        
        <div className="card best-selling-card">
            <h3 className="card-title">Sản phẩm bán chạy</h3>
            <table className="best-selling-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Inventory</th>
                        <th>Sale</th>
                        <th>Price</th>
                        <th>Today</th>
                    </tr>
                </thead>
                <tbody>
                    {bestSellingProducts.map(product => (
                        <tr key={product.id}>
                            <td>
                                <div className="product-cell">
                                    <img src={product.img} alt={product.name}/>
                                    <div>
                                        <p className="product-name">{product.name}</p>
                                        <p className="product-sub">{product.sub}</p>
                                    </div>
                                </div>
                            </td>
                            <td>{product.inventory}</td>
                            <td>{product.sale}</td>
                            <td>{product.price}</td>
                            <td>{product.today}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
      </div>
    </div>
  );
};

export default RevenuePage;