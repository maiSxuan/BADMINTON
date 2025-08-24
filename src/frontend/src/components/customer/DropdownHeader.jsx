// src/components/layout/DropdownHeader.jsx

import React, { useState } from "react"; // Thêm React vào import
import { NavLink } from "react-router-dom";
import "./DropdownHeader.css";

const DropdownHeader = ({ icon, label, menuItems = [] }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="dropdown-hover-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="action-item">
                {icon} 
                <span>{label}</span>
            </div>

            {isHovered && (
                <div className="dropdown-hover-menu">
                    {menuItems.map((item, idx) =>
                        item.action ? (
                        <div
                            key={idx}
                            className="dropdown-header-item"
                            onClick={item.action}
                            style={{ cursor: "pointer" }}
                        >
                            {item.label}
                        </div>
                        ) : (
                        <NavLink
                            key={idx}
                            to={item.to}
                            className="dropdown-header-item"
                        >
                            {item.label}
                        </NavLink>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default DropdownHeader;