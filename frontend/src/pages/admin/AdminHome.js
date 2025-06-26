
import React from 'react';
import "./AdminHome.css"
const AdminHome = () => {
  return (
    <main className="main-content">
      <section className="task-box">
        <h3 className="section-title">Danh sách cần làm</h3>
        <p className="section-subtitle">Những việc bạn sẽ phải làm</p>
        
        <div className="task-grid">
          <div className="task-item">0<br /><span>Chờ xác nhận</span></div>
          <div className="task-item">0<br /><span>Chờ lấy hàng</span></div>
          <div className="task-item">0<br /><span>Đã xử lý</span></div>
          <div className="task-item">0<br /><span>Đơn huỷ</span></div>
          <div className="task-item">0<br /><span>Trả hàng/Hoàn tiền chờ xử lí</span></div>
          <div className="task-item">0<br /><span>Sản phẩm bị tạm khoá</span></div>
          <div className="task-item">0<br /><span>Sản phẩm hết hàng</span></div>
          <div className="task-item">0<br /><span>Chương trình khuyến mãi chờ xử lý</span></div>
        </div>
      </section>

      <section className="sale-box">
        <div className="sale-header">
          <h3 className="section-title">Phân tích bán hàng</h3>
          <span className="time">Hôm nay 00:00 GMT+7 11:00</span>
        </div>
        <p className="section-subtitle">Tổng quan dữ liệu của chi nhánh đối với đơn hàng xác nhận</p>
        <div className="sale-grid">
          <div className="chart-container">
            <img src="/chart-placeholder.png" alt="minh họa" className="chart" />
          </div>
          <div className="metrics">
            <div className="metric-item">0<br /><span>Lượt truy cập</span></div>
            <div className="metric-item">0<br /><span>Lượt xem</span></div>
            <div className="metric-item">0<br /><span>Tỷ lệ chuyển đổi</span></div>
            <div className="metric-item">0<br /><span>Đơn hàng</span></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminHome;
