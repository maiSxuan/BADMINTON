// src/components/AdminHeader/AdminHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './AdminHeader.css';

import bellIcon from '../../assets/icons/Bell.svg';
import userAvatarDefault from '../../assets/icons/Admin.svg';
import { useNavigate } from 'react-router-dom';
import Logo from '../common/logo';

const AdminHeader = ({ user }) => {
  const navigate = useNavigate(); 
  const gobackHome = () => {
    navigate("/admin");
  };
  return (
    <header className="admin-header">
      <div className="header-left">
        <Link to="/admin" className="logo-link">
          <Logo size="mini"/>
        </Link>
        <div className="header-title-link" onClick={gobackHome} style={{ cursor: "pointer" }}>
          <h1 className="header-title">Kênh quản lý cửa hàng</h1>
        </div>
      </div>

      <div className="header-right">
        <button className="notification-button" aria-label="Thông báo">
          <img src={bellIcon} alt="Thông báo" className="icon-bell" />
        </button>

        <div className="admin-separator"></div>

        <div className="user-profile">
          <div className="avatar">
            <img 
              src={user && user.avatarUrl ? user.avatarUrl : userAvatarDefault} 
              alt="User Avatar" 
            />
          </div>
          <span className="user-name">{user ? user.name : 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;