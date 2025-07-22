import React, { useState, useEffect, useRef, useMemo } from 'react';
import './CustomCreatableSelect.css';

const CustomCreatableSelect = ({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = "Chọn hoặc nhập mới...",
  isLoading = false,
  isCreating = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      setInputValue(value.label);
    } else {
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setInputValue(value ? value.label : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) {
      return options;
    }
    const lowercasedInput = inputValue.toLowerCase();
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(lowercasedInput)
    );

    const isExisting = options.some(option => option.label.toLowerCase() === lowercasedInput);

    if (inputValue && !isExisting) {
      return [{ value: '__CREATE__', label: `Thêm mới "${inputValue}"`, isCreate: true }, ...filtered];
    }

    return filtered;
  }, [inputValue, options]);

  const handleSelectOption = (option) => {
    if (option.isCreate) {
      onCreateOption(inputValue);
    } else {
      onChange(option);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setInputValue('');
    setIsOpen(true);
  }

  return (
    <div className="custom-select-wrapper" ref={wrapperRef}>
      <div className="custom-select-input-container">
        <input
          type="text"
          className="form-input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={isLoading || isCreating}
        />
        {isLoading || isCreating ? (
           <div className="spinner"></div>
        ) : (
          inputValue && <button type="button" className="clear-btn" onClick={handleClear}>×</button>
        )}
      </div>
      
      {isOpen && (
        <ul className="custom-select-options">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value === '__CREATE__' ? '__CREATE__' : option.value}
                className={`option-item ${option.isCreate ? 'create-item' : ''}`}
                onClick={() => handleSelectOption(option)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="option-item disabled">Không tìm thấy kết quả</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomCreatableSelect;