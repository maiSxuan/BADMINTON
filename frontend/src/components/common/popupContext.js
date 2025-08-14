import { createContext, useState, useContext, useCallback } from 'react';
import Popup from './popup'; // Giả sử bạn đã đặt Popup.js và Popup.css trong src/components/

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: '',
    message: '',
    buttonText: '',
    onConfirm: null,
    blurIntensity: 4,
    autoCloseSeconds: null,
  });

  const showPopup = useCallback((title, message, buttonText, onConfirmCallback = null, blurValue, autoCloseSeconds = null) => {
    setPopupContent({
      title,
      message,
      buttonText,
      onConfirm: onConfirmCallback,
      blurIntensity: blurValue,
      autoCloseSeconds,
    });
    setIsOpen(true);

    if (autoCloseSeconds && autoCloseSeconds > 0) {
      setTimeout(() => {
        setIsOpen(false);
      }, autoCloseSeconds * 1000);
    }
  }, []);

  const hidePopup = () => {
    setIsOpen(false);
  };

  const confirmPopup = () => {
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
        onConfirm={confirmPopup}
        blurIntensity={popupContent.blurIntensity}
      />
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};