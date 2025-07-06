// src/components/AdminHeader/AdminHeader.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./AdminHeader.css";

import bellIcon from "../../assets/icons/Bell.svg";
import userAvatarDefault from "../../assets/icons/Admin.svg";

import Logo from "../common/logo";

const AdminHeader = ({user}) => {
  const userName = user?.fullName || "Đang tải...";
  return (
    <header className="admin-header">
      <div className="header-left">
        <Link to="/admin" className="logo-link">
          <Logo size="mini" />
        </Link>
        <Link to="/admin" className="header-title-link">
          <h1 className="header-title">Kênh quản lý cửa hàng</h1>
        </Link>
      </div>

      <div className="header-right">
        <button className="notification-button" aria-label="Thông báo">
          <img src={bellIcon} alt="Thông báo" className="icon-bell" />
        </button>

        <div className="separator"></div>

        <div className="user-profile">
          <div className="avatar">
            <img
              src={user?.avatarUrl || userAvatarDefault}
              alt="User Avatar"
            />
          </div>
          <span className="user-name">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
