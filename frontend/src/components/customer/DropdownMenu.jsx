// DropdownMenu.jsx
import React from "react";
import "./DropdownMenu.css"; 
import { NavLink } from "react-router-dom";
import chevronDown from "../../assets/icons/Chevron down.svg";

const DropdownMenu = () => {
    return (
        <div className="nav-item-dropdown">
            <NavLink to="/products" className="nav-link">
                SẢN PHẨM
                <img src={chevronDown} alt="Chevron" className="dropdown-arrow" />
            </NavLink>
            <div className="dropdown-menu">
                <div className="dropdown-content">
                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">VỢT CẦU LÔNG</h3> */}
                        <NavLink to="/vot-cau-long" className="dropdown-title">VỢT CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/vot-yonex">Vợt cầu lông Yonex</NavLink></li>
                            <li><NavLink to="/vot-lining">Vợt cầu lông Lining</NavLink></li>
                            <li><NavLink to="/vot-victor">Vợt cầu lông Victor</NavLink></li>
                            <li><NavLink to="/vot-mizuno">Vợt cầu lông Mizuno</NavLink></li>
                            <li><NavLink to="/vot-apacs">Vợt cầu lông Apacs</NavLink></li>
                            <li><NavLink to="/vot-proace">Vợt cầu lông Proace</NavLink></li>
                            <li><NavLink to="/vot-kumpoo">Vợt cầu lông Kumpoo</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>
                    
                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">GIÀY CẦU LÔNG</h3> */}
                        <NavLink to="/giay-cau-long" className="dropdown-title">GIÀY CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/giay-yonex">Giày cầu lông Yonex</NavLink></li>
                            <li><NavLink to="/giay-lining">Giày cầu lông Lining</NavLink></li>
                            <li><NavLink to="/giay-victor">Giày cầu lông Victor</NavLink></li>
                            <li><NavLink to="/giay-mizuno">Giày cầu lông Mizuno</NavLink></li>
                            <li><NavLink to="/giay-kawasaki">Giày cầu lông Kawasaki</NavLink></li>
                            <li><NavLink to="/giay-lefus">Giày cầu lông Lefus</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>

                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">ÁO CẦU LÔNG</h3> */}
                        <NavLink to="/ao-cau-long" className="dropdown-title">ÁO CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/ao-yonex">Áo cầu lông Yonex</NavLink></li>
                            <li><NavLink to="/ao-lining">Áo cầu lông Lining</NavLink></li>
                            <li><NavLink to="/ao-victor">Áo cầu lông Victor</NavLink></li>
                            <li><NavLink to="/ao-mizuno">Áo cầu lông Mizuno</NavLink></li>
                            <li><NavLink to="/ao-kawasaki">Áo cầu lông Kawasaki</NavLink></li>
                            <li><NavLink to="/ao-kamito">Áo cầu lông Kamito</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>

                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">QUẦN/VÁY CẦU LÔNG</h3> */}
                        <NavLink to="/quan-vay-cau-long" className="dropdown-title">QUẦN/VÁY CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/quan-vay-yonex">Quần/Váy cầu lông Yonex</NavLink></li>
                            <li><NavLink to="/quan-vay-lining">Quần/Váy vợt cầu lông Lining</NavLink></li>
                            <li><NavLink to="/quan-vay-victor">Quần/Váy cầu lông Victor</NavLink></li>
                            <li><NavLink to="/quan-vay-mizuno">Quần/Váy cầu lông Mizuno</NavLink></li>
                            <li><NavLink to="/quan-vay-kawasaki">Quần/Váy cầu lông Kawasaki</NavLink></li>
                            <li><NavLink to="/quan-vay-forza">Quần/Váy cầu lông Forza</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>

                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">BALO CẦU LÔNG</h3> */}
                        <NavLink to="/balo-cau-long" className="dropdown-title">BALO CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/balo-yonex">Balo cầu lông Yonex</NavLink></li>
                            <li><NavLink to="/balo-lining">Balo cầu lông Lining</NavLink></li>
                            <li><NavLink to="/balo-victor">Balo cầu lông Victor</NavLink></li>
                            <li><NavLink to="/balo-mizuno">Balo cầu lông Mizuno</NavLink></li>
                            <li><NavLink to="/balo-kawasaki">Balo cầu lông Kawasaki</NavLink></li>
                            <li><NavLink to="/balo-forza">Balo cầu lông Forza</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>

                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">TÚI VỢT CẦU LÔNG</h3> */}
                        <NavLink to="/tui-vot-cau-long" className="dropdown-title">TÚI VỢT CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/tui-vot-yonex">Túi vợt cầu lông Yonex</NavLink></li>
                            <li><NavLink to="/tui-vot-lining">Túi vợt cầu lông Lining</NavLink></li>
                            <li><NavLink to="/tui-vot-victor">Túi vợt cầu lông Victor</NavLink></li>
                            <li><NavLink to="/tui-vot-mizuno">Túi vợt cầu lông Mizuno</NavLink></li>
                            <li><NavLink to="/tui-vot-kawasaki">Túi vợt cầu lông Kawasaki</NavLink></li>
                            <li><NavLink to="/tui-vot-forza">Túi vợt cầu lông Forza</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>

                    <div className="dropdown-column">
                        {/* <h3 className="dropdown-title">PHỤ KIỆN CẦU LÔNG</h3> */}
                        <NavLink to="/phu-kien-cau-long" className="dropdown-title">PHỤ KIỆN CẦU LÔNG</NavLink>
                        <ul className="dropdown-list">
                            <li><NavLink to="/vo-cau-long">Vớ cầu lông</NavLink></li>
                            <li><NavLink to="/cuoc-cau-long">Cước đan vợt cầu lông</NavLink></li>
                            <li><NavLink to="/qua-cau-long">Quả cầu lông</NavLink></li>
                            <li><NavLink to="/bang-bo-co">Băng bó cơ</NavLink></li>
                            <li><NavLink to="/bang-chan-mo-hoi">Băng chặn mồ hôi</NavLink></li>
                            <li><NavLink to="/binh-nuoc">Bình nước</NavLink></li>
                            <li><NavLink to="/xem-them" className="more-link">Xem thêm</NavLink></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DropdownMenu;
