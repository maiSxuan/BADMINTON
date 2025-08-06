// src/components/Popup.js

import React from 'react';
import './popup.css'; // Import file CSS

const Popup = ({ isOpen, title, message, buttonText, onClose }) => {
  // Nếu prop `isOpen` là false, không render gì cả
  if (!isOpen) {
    return null;
  }

  // Ngăn chặn sự kiện click lan ra overlay khi click vào container
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={handleContainerClick}>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>      
        <button className="popup-button" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Popup;