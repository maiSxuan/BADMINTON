
import { NavLink } from "react-router-dom";
import "./Header.css";
import DropdownMenu from "../customer/DropdownMenu";
import DropdownHeader from "./DropdownHeader";
import Logo from "../common/logo";

import { UserIcon, Search,Info,ShoppingCart} from "lucide-react";
const Header = () => {
  const isLoggedIn = !!localStorage.getItem("token");

  const accountMenu = isLoggedIn
    ? [
        { label: "Tài khoản của tôi", to: "/account/profile" },
        { label: "Đăng xuất", to: "/Login" },
      ]
    : [
        { label: "Đăng nhập", to: "/login" },
        { label: "Đăng ký", to: "/registration" },
      ];

  const orderTrackingMenu = [
    { label: "Theo dõi đơn hàng", to: "/order-tracking" },
    { label: "Lịch sử mua hàng", to: "/order-history" },
  ];

  return (
    <header className="site-header">
      <div className="main-header">
        <div className="left-group">
          <div className="header-group logo-group">
            <Logo size="mini" />
          </div>
          <div className="header-group support-group">
            <div className="support-item">
              <i className="fa-solid fa-phone"></i>
              <div className="support-text">
                <strong>Hotline</strong>
                <span>0948245045</span>
              </div>
            </div>
          </div>
        </div>

        <div className="center-group">
          <div className="header-group search-group">
            <div className="search-box">
              <input type="text" placeholder="Bạn muốn tìm gì hôm nay?" />
              <button aria-label="Tìm kiếm">
                <i className="fa-solid fa-magnifying-glass"></i>
                <Search/>
              </button>
            </div>
          </div>
        </div>

        <div className="right-group header-group user-actions-group">
          <DropdownHeader 
            icon = {<Info/>}
            label="TRA CỨU"
            menuItems={orderTrackingMenu}
          />

          <DropdownHeader 
            icon = {<UserIcon/>}
            label="TÀI KHOẢN"
            menuItems={accountMenu}
          />

          <NavLink to="/cart" className="action-item cart">
            <ShoppingCart/>
            <span>GIỎ HÀNG</span>
            <span className="badge">0</span>
          </NavLink>
        </div>
      </div>

      <div className="nav-container">
        <nav className="navbar">
          <NavLink to="/">TRANG CHỦ</NavLink>
          <DropdownMenu />
          <NavLink to="/sale">SALE OFF</NavLink>
          <NavLink to="/franchise">CHÍNH SÁCH NHƯỢNG QUYỀN</NavLink>
          <NavLink to="/about">GIỚI THIỆU</NavLink>
          <NavLink to="/contact">LIÊN HỆ</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
