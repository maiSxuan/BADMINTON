// src/components/AdminHeader/AdminHeader.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./AdminHeader.css";

import bellIcon from "../../assets/icons/Bell.svg";
import userAvatarDefault from "../../assets/icons/Admin.svg";
import { useNavigate } from "react-router-dom";
import Logo from "../common/logo";

const AdminHeader = ({user}) => {
  const userName = user?.name || "Đang tải...";
  const navigate = useNavigate(); 
  const gobackHome = () => {
    navigate("/admin");
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/login");
    }
  };
  return (
    <header className="admin-header">
      <div className="header-left">
        <Link to="/admin" className="logo-link">
          <Logo size="mini" />
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
            <img src={user?.avatarUrl || userAvatarDefault} alt="User Avatar" />
          </div>
          <span className="user-name">{userName}</span>
          <button
            className="logout-button"
            onClick={handleLogout}
            style={{
              marginLeft: "10px",
              background: "transparent",
              border: "1px solid #ccc",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;