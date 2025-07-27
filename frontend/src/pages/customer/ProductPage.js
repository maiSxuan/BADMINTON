import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './ProductPage.css';

// Dữ liệu tĩnh cho bộ lọc giá
const priceRanges = {
    'range1': { label: "Dưới 500,000đ" },
    'range2': { label: "500,000đ - 1,000,000đ" },
    'range3': { label: "1,000,000đ - 2,000,000đ" },
    'range4': { label: "2,000,000đ - 3,000,000đ" },
    'range5': { label: "Trên 3,000,000đ" }
};

function ProductPage() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isFiltersLoading, setIsFiltersLoading] = useState(true);

    const [filters, setFilters] = useState({
        price: null,
        brands: [],
        categories: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    
    // Tải dữ liệu bộ lọc (brands, categories)
    useEffect(() => {
        const fetchFilterData = async () => {
            setIsFiltersLoading(true);
            try {
                const [brandsRes, categoriesRes] = await Promise.all([
                    fetch('/api/brands'),
                    fetch('/api/categories')
                ]);

                if (!brandsRes.ok || !categoriesRes.ok) {
                    throw new Error('Không thể tải dữ liệu bộ lọc.');
                }

                const brandsData = await brandsRes.json();
                const categoriesData = await categoriesRes.json();
                
                setBrands(brandsData);
                setCategories(categoriesData);
            } catch (err) {
                setError(prevError => prevError || err.message);
            } finally {
                setIsFiltersLoading(false);
            }
        };
        fetchFilterData();
    }, []);

    // Tải sản phẩm dựa trên bộ lọc và trang hiện tại
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null); 
        
        const params = new URLSearchParams({ page: currentPage, view:'public' });
        if (filters.price) {
            params.append('price', filters.price);
        }

        params.append('brands', filters.brands.length > 0 ? filters.brands.join(',') : 'all');
        params.append('categories', filters.categories.length > 0 ? filters.categories.join(',') : 'all');

        try {
            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tải dữ liệu sản phẩm.');
            }
            const result = await response.json();
            setProducts(result.data);
            setPagination(result.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // *** SỬA LỖI VÀ CẢI TIẾN TÍNH NĂNG TẠI ĐÂY ***
    const handleFilterChange = (filterType, value) => {
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters };

            // Xử lý cho Radio Button (bộ lọc giá)
            if (filterType === 'price') {
                // Nếu click vào radio đang được chọn -> bỏ chọn (set về null)
                // Nếu click vào radio khác -> chọn giá trị mới
                newFilters.price = prevFilters.price === value ? null : value;
            } 
            // Xử lý cho Checkbox (brands, categories)
            else { 
                const currentValues = prevFilters[filterType] || [];
                
                if (currentValues.includes(value)) {
                    // Nếu đã có trong mảng -> loại bỏ nó (bỏ chọn)
                    newFilters[filterType] = currentValues.filter(item => item !== value);
                } else {
                    // Nếu chưa có -> thêm nó vào mảng (chọn thêm)
                    newFilters[filterType] = [...currentValues, value];
                }
            }
            
            return newFilters;
        });
        // Reset về trang đầu tiên mỗi khi bộ lọc thay đổi
        setCurrentPage(1);
    };

    const renderFilterGroup = (title, items, filterType, selectedValues) => (
        <div className="filter-group">
            <h3>{title}</h3>
            <ul>
                {items.map(item => (
                    <li key={item._id || item.slug}>
                        <label>
                            <input
                                type="checkbox"
                                value={item.slug}
                                checked={selectedValues.includes(item.slug)}
                                onChange={() => handleFilterChange(filterType, item.slug)}
                            /> {item.name}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="container">
            <main className="product-page-layout">
                <aside className="sidebar">
                    <div className="filter-group">
                        <h3>CHỌN MỨC GIÁ</h3>
                        <ul>
                            {Object.entries(priceRanges).map(([key, { label }]) => (
                                <li key={key}>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="price" 
                                            value={key} 
                                            // Sử dụng onClick thay vì onChange để bắt được sự kiện click lại
                                            onClick={(e) => handleFilterChange('price', e.target.value)}
                                            // Vẫn cần checked để hiển thị đúng trạng thái
                                            checked={filters.price === key}
                                            // Thêm onChange rỗng để tránh warning của React
                                            onChange={() => {}}
                                        /> {label}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {isFiltersLoading ? (
                        <p>Đang tải bộ lọc...</p>
                    ) : (
                        <>
                            {renderFilterGroup("THƯƠNG HIỆU", brands, 'brands', filters.brands)}
                            {renderFilterGroup("CHỌN SẢN PHẨM", categories, 'categories', filters.categories)}
                        </>
                    )}
                </aside>

                <section className="product-content">
                    {isLoading ? <p>Đang tải sản phẩm...</p> : 
                     error ? <p className="no-products">{error}</p> : 
                     (
                        <>
                            <div className="product-grid">
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <Link to={`/products/${product.slug}`} key={product.id} className="product-card">
                                            <img src={product.imageUrl || 'https://via.placeholder.com/250?text=No+Image'} alt={product.name} />
                                            <h4>{product.name}</h4>
                                            <p className="price">{product.price.toLocaleString('vi-VN')} ₫</p>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p>
                                )}
                            </div>
                            <nav className="pagination">
                                {pagination.totalPages > 1 &&
                                    Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNumber => (
                                        <button key={pageNumber} className={currentPage === pageNumber ? 'active' : ''}
                                            onClick={() => setCurrentPage(pageNumber)}>
                                            {pageNumber}
                                        </button>
                                    ))}
                            </nav>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default ProductPage;