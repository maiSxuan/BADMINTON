import React, { createContext, useState, useContext, useCallback } from 'react';
import Popup from './popup'; // Giả sử bạn đã đặt Popup.js và Popup.css trong src/components/

// 1. Tạo Context
const PopupContext = createContext();

// 2. Tạo Provider Component
export const PopupProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: '',
    message: '',
    buttonText: '',
    onConfirm: null, // Hàm callback tùy chọn
  });

  // Hàm để hiển thị popup, có thể nhận thêm một hàm callback
  const showPopup = useCallback((title, message, buttonText, onConfirmCallback = null) => {
    setPopupContent({
      title,
      message,
      buttonText,
      onConfirm: onConfirmCallback,
    });
    setIsOpen(true);
  }, []);

  // Hàm để đóng popup
  const hidePopup = () => {
    // Nếu có hàm callback, thực thi nó trước khi đóng
    if (popupContent.onConfirm && typeof popupContent.onConfirm === 'function') {
      popupContent.onConfirm();
    }
    setIsOpen(false);
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      <Popup
        isOpen={isOpen}
        title={popupContent.title}
        message={popupContent.message}
        buttonText={popupContent.buttonText}
        onClose={hidePopup}
      />
    </PopupContext.Provider>
  );
};

// 3. Tạo custom Hook để dễ dàng sử dụng
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};