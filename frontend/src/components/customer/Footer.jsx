import React from "react";
import "./Footer.css";
import Logo from "../common/icons/logo";

const Footer = () => {
  return (
    <div className="footer">
      <div className="mid-footer">
        <div className="container">
          <div className="row">
            <div className="footer-col logo-col">
              <Logo className="small" />
            </div>
            <div className="footer-col">
            <h4>Thông tin liên hệ</h4>
            <div className="contact-info">
                <div>Email: scdbadmintonhelp@gmail.com</div>
                <div>Hotline: 0948245045</div>
                <div>Địa chỉ: 227 Nguyễn Văn Cừ, Quận 5, TP.HCM</div>
              </div>
            </div>
            <div className="footer-col">
              <h4>Chính sách</h4>
              <ul>
                <li><a href="#doitra">Chính sách nhượng quyền</a></li>
                <li><a href="#vanchuyen">Chính sách đổi trả</a></li>
                <li><a href="#baomat">Chính sách bảo hành</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Hướng dẫn</h4>
              <ul>
                <li><a href="#muahang">Hướng dẫn mua hàng</a></li>
                <li><a href="#thanhtoan">Hướng dẫn thanh toán</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div> 
      <div className="bottom-footer">
        <div className="container">
          <span>© 2025 Badminton Shop. All rights reserved</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
