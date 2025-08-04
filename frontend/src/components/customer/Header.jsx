import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import DropdownMenu from "../customer/DropdownMenu";
import DropdownHeader from "./DropdownHeader";

// Import các component/ảnh
import Logo from "../common/logo";
import { UserIcon, Search,Info,ShoppingCart} from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 
  //const [isLoggedIn, setIsLoggedIn] = useState(false);

 useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      setUser(token && storedUser ? JSON.parse(storedUser) : null);
    };

    checkLogin();
    window.addEventListener("loginStatusChanged", checkLogin);
    return () => window.removeEventListener("loginStatusChanged", checkLogin);
  }, []);

  
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/");
  };

  const accountMenu = !user
  ? [
      { label: "Đăng nhập", to: "/login" },
      { label: "Đăng ký", to: "/registration" },
    ]
  : [
      { label: "Tài khoản của tôi", to: "/account/profile" },
      { label: "Đăng xuất", action: handleLogout },
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
         <NavLink to="/order-history" className="action-item">
          <Search size={20} />
          <span>TRA CỨU</span>
        </NavLink>

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