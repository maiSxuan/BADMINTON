import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

// Import các component/ảnh
import Logo from "../common/logo";
import userIcon from '../../assets/icons/User.svg';
import cartIcon from '../../assets/icons/Shopping cart.svg';
import searchIcon from '../../assets/icons/Info.svg';
import locationIcon from '../../assets/icons/Map pin.svg';
import search from '../../assets/icons/Search.svg';
const Header = () => {
  return (
    <header className="site-header">
        <div className="main-header">
          {/* Nhóm 1: Logo */}
          <div className="header-group logo-group">
              <Logo size="mini" />
          </div>
          {/* Nhóm 2: Hỗ trợ (Hotline, Cửa hàng) */}
          <div className="header-group support-group">
            <div className="support-item">
              <i className="fa-solid fa-phone"></i>
              <div className="support-text">
                <strong>Hotline</strong>
                <span>0948245045</span>
              </div>
            </div>
          {/* Nhóm 3: Tìm kiếm */}
          <div className="header-group search-group">
            <div className="search-box">
              <input type="text" placeholder="Bạn muốn tìm gì hôm nay?" />
              <button aria-label="Tìm kiếm">
                <i className="fa-solid fa-magnifying-glass"></i>
                <img src={search} alt="Search icon"/>
              </button>
            </div>
          </div>

          
            <NavLink to="/stores" className="support-item">
              <img src={locationIcon} alt="Hệ thống cửa hàng" />
              <div className="support-text">
                <strong>Hệ thống của hàng</strong>
              </div>
            </NavLink>
          </div>

          {/* Nhóm 4: Hành động người dùng */}
          <div className="header-group user-actions-group">
            <NavLink to="/order-tracking" className="action-item">
              <img src={searchIcon} alt="Tra cứu đơn hàng" />
              <span>TRA CỨU</span>
            </NavLink>
            <NavLink to="/account" className="action-item">
              <img src={userIcon} alt="Tài khoản" />
              <span>TÀI KHOẢN</span>
            </NavLink>
            <NavLink to="/cart" className="action-item cart">
              <img src={cartIcon} alt="Giỏ hàng" />
              <span>GIỎ HÀNG</span>
              <span className="badge">0</span>
            </NavLink>
          </div>
        </div>
        <div className ="nav-container">
        <nav className="navbar">
          
          <NavLink to="/">TRANG CHỦ</NavLink>
          <NavLink to="/products">SẢN PHẨM</NavLink>
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