import React from 'react';
import { Link } from 'react-router-dom';
import './breadcrumb.css';

// Component nhận vào prop `items` là một mảng các đối tượng
// Ví dụ: [{ label: 'Quản lý sản phẩm', path: '/admin/products' }, { label: 'Thêm sản phẩm' }]
const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null; // Không hiển thị gì nếu không có item
  }

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-container">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {/* Nếu item không phải là item cuối cùng, nó sẽ là một link */}
            {index < items.length - 1 && item.path ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              // Item cuối cùng (trang hiện tại) chỉ là text
              <span className="current-page">{item.label}</span>
            )}
            
            {/* Hiển thị dấu phân cách, trừ item cuối cùng */}
            {index < items.length - 1 && <span className="separator">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;