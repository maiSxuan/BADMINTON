import React from "react";
// 1. IMPORT LINK TỪ REACT-ROUTER-DOM
import { Link } from "react-router-dom"; 
import "./Footer.css";
import Logo from "../common/logo";

const Footer = () => {
  return (
    <div className="footer">
      <div className="mid-footer">
        <div className="footer-container">
          <div className="row">
            <div className="footer-col logo-col">
              <Link to="/">
                <Logo size="small" />
              </Link>
            </div>

            {/* Cột Thông tin liên hệ */}
            <div className="footer-col">
              <h4>Thông tin liên hệ</h4>
              <div className="footer-contact-info">
                <div>Email: scdbadmintonhelp@gmail.com</div>
                <div>Hotline: 0948245045</div>
                <div>Địa chỉ: 227 Nguyễn Văn Cừ, Quận 5, TP.HCM</div>
              </div>
            </div>

            {/* Cột Chính sách */}
            <div className="footer-col">
              <h4>Chính sách</h4>
              <ul>
                <li><Link to="/franchise">Chính sách nhượng quyền</Link></li>
                <li><Link to="/return">Chính sách đổi trả</Link></li>
                <li><Link to="/warranty">Chính sách bảo hành</Link></li>
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