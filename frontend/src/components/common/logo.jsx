import React from 'react';
import './logo.css';
import logoImage from "../../assets/icons/SCD.png"

//Thêm sizes vô đây
const SIZES = {
  mini:{width:100, height:100},
  small: { width: 175, height: 175 },
  medium: { width: 409, height: 409 },
  large: { width: 646, height: 646 },
  'extra-large': { width: 800, height: 800 },
};
const Logo = ({ size = 'medium' }) => {
  const style = SIZES[size] || SIZES.medium;

  return (
    <img
      src={logoImage}
      alt="SCD Shop Logo"
      className="logo-image"
      style={style} // Áp dụng style đã lấy được
    />
  );
};

export default Logo;