// src/components/Sidebar/AdminSidebar.jsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

  const menuItems = [
    {
      id: 'users',
      title: 'Quản lý người dùng',
      subItems: [
        { label: 'Xem thông tin người dùng', path: '/admin/user-list' }, 
      ],
    },
    {
      id: 'orders',
      title: 'Quản lý đơn hàng',
      subItems: [
        { label: 'Tất cả', path: '/admin/all-orders' },
        { label: 'Đơn hủy', path: '/admin/cancelled-orders' },
      ],
    },
    {
      id: 'products',
      title: 'Quản lý sản phẩm',
      subItems: [
        { label: 'Tất cả sản phẩm', path: '/admin/all-products' },
        { label: 'Thêm sản phẩm', path: '/admin/add-product' },
      ],
    },
    {
      id: 'finance',
      title: 'Tài chính',
      subItems: [
        { label: 'Doanh thu', path: '/admin/revenue' },
        { label: 'Số dư tài khoản', path: '/admin/balance' },
      ],
    },
    {
      id: 'promotions',
      title: 'Khuyến mãi',
      subItems: [
        {label: 'Tạo chiến dịch', path:'/admin/add-promotion'},
        {label: 'Quản lí khuyến mãi', path:'/admin/manage-promotion'}
      ]
    }
  ];

const AdminSidebar = () => {
  const [openSectionIds, setOpenSectionIds] = useState([]);

  const handleToggle = (sectionId) => {
    setOpenSectionIds(prevOpenIds => {
      const isOpen = prevOpenIds.includes(sectionId);
      if (isOpen) {
        return prevOpenIds.filter(id => id !== sectionId); 
      } else {
        return [...prevOpenIds, sectionId];
      }
    });
  };

  return (
    <aside className="admin-sidebar">
      {menuItems.map((section) => {
  
        const isOpen = openSectionIds.includes(section.id);

        return (
          <div key={section.id} className="sidebar-section">
            <div className="admin-section-header" onClick={() => handleToggle(section.id)}>
              <h3 className="admin-section-title">{section.title}</h3>
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