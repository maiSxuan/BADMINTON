// src/components/AdminHeader/AdminHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './AdminHeader.css';

// Import các file SVG như là các biến
import bellIcon from '../../assets/icons/Bell.svg';
import userAvatarDefault from '../../assets/icons/Admin.svg';

// Import component Logo đã có
import Logo from '../common/logo';

const AdminHeader = ({ user }) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <Link to="/admin/dashboard" className="logo-link">
          {/* Giả sử component Logo đã được style phù hợp */}
          <Logo size="mini"/>
        </Link>
        <h1 className="header-title">Kênh quản lý cửa hàng</h1>
      </div>

      <div className="header-right">
        <button className="notification-button" aria-label="Thông báo">
          {/* Sử dụng file SVG đã import cho icon chuông */}
          <img src={bellIcon} alt="Thông báo" className="icon-bell" />
        </button>

        <div className="separator"></div>

        <div className="user-profile">
          <div className="avatar">
            {/* 
              Hiển thị avatar của người dùng nếu có,
              nếu không thì hiển thị avatar mặc định từ file SVG.
            */}
            <img 
              src={user && user.avatarUrl ? user.avatarUrl : userAvatarDefault} 
              alt="User Avatar" 
            />
          </div>
          <span className="user-name">{user ? user.name : 'Đang tải...'}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;