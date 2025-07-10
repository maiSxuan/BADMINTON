import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./DropdownHeader.css";

const DropdownHeader = ({ icon, label, menuItems }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="dropdown-hover-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="action-item">
                <img src={icon} alt={label} />
                <span>{label}</span>
            </div>

            {isHovered && (
                <div className="dropdown-hover-menu">
                    {menuItems.map((item, idx) => (
                        <NavLink key={idx} to={item.to} className="dropdown-header-item">
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};
export default DropdownHeader;