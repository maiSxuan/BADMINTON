// src/components/AdminHeader/AdminHeader.jsx

import { usePopup } from '../../components/common/popupContext';
import { Link, useNavigate } from "react-router-dom";
import "./AdminHeader.css";

import { UserIcon } from 'lucide-react';
import Logo from "../common/logo";

const AdminHeader = ({user}) => {
  const userName = user?.name || "Đang tải...";
  const navigate = useNavigate(); 
  const gobackHome = () => {
    navigate("/admin");
  };

  const { showPopup } = usePopup();
  const handleLogout = () => {
    showPopup(
      "Xác nhận đăng xuất",                    // title
      "Bạn có chắc chắn muốn đăng xuất?",     // message
      "Đăng xuất",                            // buttonText (confirm)
      async () => {                           // onConfirm callback
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        showPopup("Thành công", "Bạn đã đăng xuất", "Đóng");
        navigate("/login");
      }
    );
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
        <div className="user-profile">
          <div>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="User Avatar"
              />
            ) : (
              <UserIcon color="#6c757d" size={30} /> 
            )}
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