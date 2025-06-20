// src/components/Sidebar/AdminSidebar.jsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

// Dữ liệu menu không đổi
const menuItems = [
    { id: 'users', title: 'Quản lý người dùng', subItems: [ { label: 'Xem thông tin người dùng', path: '/admin/users' }, { label: 'Khóa tài khoản', path: '/admin/users/lock' }, { label: 'Reset mật khẩu', path: '/admin/users/reset' }, ], }, { id: 'orders', title: 'Quản lý đơn hàng', subItems: [ { label: 'Tất cả', path: '/admin/orders' }, { label: 'Đơn hủy', path: '/admin/orders/cancelled' }, ], }, { id: 'products', title: 'Quản lý sản phẩm', subItems: [ { label: 'Tất cả sản phẩm', path: '/admin/products' }, { label: 'Thêm sản phẩm', path: '/admin/products/add' }, ], }, { id: 'customer-care', title: 'Chăm sóc khách hàng', subItems: [ { label: 'Quản lý chat', path: '/admin/chat' }, { label: 'Quản lý đánh giá', path: '/admin/reviews' }, ], }, { id: 'finance', title: 'Tài chính', subItems: [ { label: 'Doanh thu', path: '/admin/finance/revenue' }, { label: 'Số dư tài khoản', path: '/admin/finance/balance' }, ], },
];

const AdminSidebar = () => {
  // [THAY ĐỔI 1] Sử dụng mảng để lưu các ID đang mở
  const [openSectionIds, setOpenSectionIds] = useState([]);

  // [THAY ĐỔI 2] Cập nhật logic toggle
  const handleToggle = (sectionId) => {
    setOpenSectionIds(prevOpenIds => {
      const isOpen = prevOpenIds.includes(sectionId);
      if (isOpen) {
        return prevOpenIds.filter(id => id !== sectionId); // Đóng section
      } else {
        return [...prevOpenIds, sectionId]; // Mở section
      }
    });
  };

  return (
    <aside className="admin-sidebar">
      {menuItems.map((section) => {
        // [THAY ĐỔI 3] Kiểm tra xem section có trong mảng không
        const isOpen = openSectionIds.includes(section.id);

        return (
          <div key={section.id} className="sidebar-section">
            <div className="section-header" onClick={() => handleToggle(section.id)}>
              <h3 className="section-title">{section.title}</h3>
              <span className={`arrow ${isOpen ? 'down' : 'up'}`}></span>
            </div>

            <div className={`submenu ${isOpen ? 'open' : ''}`}>
              <ul>
                {section.subItems.map((item, index) => (
                  <li key={index}>
                    <NavLink to={item.path}>{item.label}</NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </aside>
  );
};

export default AdminSidebar;