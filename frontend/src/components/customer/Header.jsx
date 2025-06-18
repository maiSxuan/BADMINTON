import React from "react";
import "./Header.css";
import Logo from "../common/icons/logo"

const Header = () => {
  return (
    <>
    <div className="header">
        <div className="top-header">
            <Logo className="logo-small"/>
            <div className="label">
                <p className="hotline">
                    <span className="text-wrapper">Hotline: 0948245045</span>
                </p>
            </div>
    <div class="search-box">
      <input type="text" placeholder="Tìm sản phẩm..." />
      <button><i></i></button>
      <div class="right">
        <i class="fa-solid fa-location-dot"></i>
        <span>HỆ THỐNG CỬA HÀNG</span>
      </div>
    </div>

        </div>

        

          
    </div>

        
    </>
  );
};

export default Header;
