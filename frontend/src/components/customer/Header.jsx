import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Header.css";
import DropdownMenu from "../customer/DropdownMenu";
import DropdownHeader from "./DropdownHeader";
import Breadcrumb from "../common/breadcrumb";
import { useLocation } from "react-router-dom";
import { fetchCart } from "../../services";
import Logo from "../common/logo";
import { UserIcon, Search, ShoppingCart, InfoIcon } from "lucide-react";
import { getProductsOnQuery } from "../../services";
import { usePopup } from "../common/popupContext";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // State cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cartItemCount, setcartItemCount] = useState(0);
    const searchBoxRef = useRef(null);

    const { showPopup } = usePopup()

    // Breadcrumb (code cũ)
    const breadcrumbMap = {
        "/account/profile": [
            { label: "Tài khoản", path: "/account/profile" },
            { label: "Tài khoản của tôi" }
        ],
        "/order-history": [
            { label: "Lịch sử mua hàng" }
        ],
        "/cart": [
            { label: "Giỏ hàng", path: "/cart" },
            { label: "Giỏ hàng của bạn" }
        ]
    };
    const breadcrumbItems = breadcrumbMap[location.pathname] || [];

    // useEffect(() => {
    //   const checkLogin = () => {
    //     const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    //     const storedUser = localStorage.getItem("user");
    //     setUser(token && storedUser ? JSON.parse(storedUser) : null);
    //   };

    //   checkLogin();
    //   window.addEventListener("loginStatusChanged", checkLogin);
    //   return () => window.removeEventListener("loginStatusChanged", checkLogin);
    // }, []);

    useEffect(() => {
        const loadUserAndCart = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            const parsedUser = token && storedUser ? JSON.parse(storedUser) : null;
            setUser(parsedUser);

            if (parsedUser) {
                try {
                    const cartData = await fetchCart();
                    setcartItemCount(cartData.items?.length || 0);
                } catch (err) {
                    console.error("Failed to fetch cart total", err);
                    setcartItemCount(0);
                }
            } else {
                setcartItemCount(0);
            }
        };

        loadUserAndCart();

        window.addEventListener("loginStatusChanged", loadUserAndCart);
        window.addEventListener("cartUpdated", loadUserAndCart);

        return () => {
            window.removeEventListener("loginStatusChanged", loadUserAndCart);
            window.removeEventListener("cartUpdated", loadUserAndCart);
        };
    }, []);

    // Logic tìm kiếm gợi ý động (code mới)
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const debounceTimer = setTimeout(() => {
            const fetchSuggestions = async () => {
                try {
                    const result = await getProductsOnQuery({ search: searchTerm, limit: 5 });
                    setSuggestions(result.data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Lỗi khi lấy gợi ý tìm kiếm:", error);
                    setSuggestions([]);
                }
            };
            fetchSuggestions();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    // Logic đóng gợi ý khi click ra ngoài (code mới)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logic Đăng xuất (code cũ)
    const handleLogout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.dispatchEvent(new Event("loginStatusChanged"));
        navigate("/");
    };

    const accountMenu = !user
        ? [{ label: "Đăng nhập", to: "/login" }, { label: "Đăng ký", to: "/registration" }]
        : [{ label: "Tài khoản của tôi", to: "/account/profile" }, { label: "Đăng xuất", action: handleLogout }];

    
    // const orderTrackingMenu = [{ label: "Lịch sử mua hàng", to: "/order-history", onClick: handleOrderHistoryClick }];

    // Xử lý khi submit form tìm kiếm (code mới)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== '') {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowSuggestions(false);
            setSearchTerm('');
        }
    };

    const handleCartClick = (e) => {
        if (!user) {
            e.preventDefault();
            showPopup(
                "Chưa đăng nhập",
                "Bạn cần đăng nhập để xem giỏ hàng",
                "Đăng nhập",
                () => navigate("/login"),
                4
            );
        }
    };

    const handleOrderHistoryClick = (e) => {
        if (!user) {
            e.preventDefault();
            showPopup(
                "Chưa đăng nhập",
                "Bạn cần đăng nhập để xem lịch sử mua hàng",
                "Đăng nhập",
                () => navigate("/order-history"),
                4
            );
        }
    };

    return (
        <header className="site-header">
            <div className="main-header">
                <div className="left-group">
                    <div className="header-group logo-group"><Logo size="mini" /></div>
                    <div className="header-group support-group">
                        <div className="support-item">
                            <i className="fa-solid fa-phone"></i>
                            <div className="support-text"><strong>Hotline</strong><span>0948245045</span></div>
                        </div>
                    </div>
                </div>

                <div className="center-group">
                    <div className="header-group search-group">
                        {/* --- CẤU TRÚC MỚI CHO SEARCH BOX --- */}
                        <form className="search-box" onSubmit={handleSearchSubmit} ref={searchBoxRef}>
                            <input
                                type="text"
                                placeholder="Bạn muốn tìm gì hôm nay?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.trim() !== '' && setShowSuggestions(true)}
                            />
                            <button type="submit" aria-label="Tìm kiếm"><Search /></button>

                            {/* Khung gợi ý được đặt bên trong form */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="search-suggestions">
                                    <div className="suggestions-header">Gợi ý tìm kiếm</div>
                                    <ul>
                                        {suggestions.map(product => (
                                            <li key={product.id}>
                                                <NavLink
                                                    to={`/products/${product.slug}`}
                                                    onClick={() => { setSearchTerm(''); setShowSuggestions(false); }}
                                                >
                                                    <img src={product.imageUrl || '/logo192.png'} alt={product.name} />
                                                    <div className="suggestion-info">
                                                        <span>{product.name}</span>
                                                        <span>{product.price.toLocaleString('vi-VN')}₫</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div className="right-group header-group user-actions-group">
                    {/* <DropdownHeader icon={<InfoIcon size={20} />} label="TRA CỨU" menuItems={orderTrackingMenu} /> */}
                    <NavLink to="/order-history" className="action-item" onClick={handleOrderHistoryClick}>
                        <InfoIcon size={20} />
                        <span>TRA CỨU</span>
                    </NavLink>
                    <DropdownHeader icon={<UserIcon />} label="TÀI KHOẢN" menuItems={accountMenu} />
                    <NavLink to="/cart" className="action-item cart" onClick={handleCartClick}>
                        <ShoppingCart /><span>GIỎ HÀNG</span><span className="badge">{cartItemCount > 0 ? cartItemCount : 0}</span>
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

            {breadcrumbItems.length > 0 && (
                <div className="breadcrumb-wrapper"><Breadcrumb items={breadcrumbItems} /></div>
            )}
        </header>
    );
};

export default Header;