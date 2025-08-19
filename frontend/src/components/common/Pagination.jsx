// src/components/common/Pagination.jsx
import './Pagination.css';

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Nếu chỉ có 1 trang hoặc không có trang nào, không cần hiển thị
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="pagination-container">
            <ul className="pagination-list">
                {pageNumbers.map((number) => (
                    <li key={number} className="pagination-item">
                        <button
                            onClick={() => paginate(number)}
                            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Pagination;
