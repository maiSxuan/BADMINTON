import React from 'react';
import './logo.css';
import logo from '../../../assets/icons/SCD.png';

//Tái sử dụng bằng cách <logo size ="small" "medium" hoặc "large"/>
const Logo = ({ size = 'logo-medium' }) => {
  return (
    <img
      src={logo}
      alt="Logo"
      className={`logo-${size}`}
    />
  );
};

export default Logo;