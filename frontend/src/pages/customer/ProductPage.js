import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ProductPage.css';
import { getAllBrands,getAllCategories } from '../../services';


// Dữ liệu tĩnh cho bộ lọc giá
const priceRanges = {
    'range1': { label: "Dưới 500,000đ" },
    'range2': { label: "500,000đ - 1,000,000đ" },
    'range3': { label: "1,000,000đ - 2,000,000đ" },
    'range4': { label: "2,000,000đ - 3,000,000đ" },
    'range5': { label: "Trên 3,000,000đ" }
};

function ProductPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // State cho dữ liệu
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // State cho trạng thái UI
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFiltersLoading, setIsFiltersLoading] = useState(true);
    
    // State cho bộ lọc và phân trang
    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(location.search);
        const urlCategories = params.get('categories')?.split(',').filter(Boolean) || [];
        const urlBrands = params.get('brands')?.split(',').filter(Boolean) || [];
        const urlPrice = params.get('price') || null;
        return { price: urlPrice, brands: urlBrands, categories: urlCategories };
    });
    const [currentPage, setCurrentPage] = useState(1);
    
    // Effect này sẽ đồng bộ state `filters` khi URL thay đổi (ví dụ: click từ menu, back/forward trình duyệt)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlCategories = params.get('categories')?.split(',').filter(Boolean) || [];
        const urlBrands = params.get('brands')?.split(',').filter(Boolean) || [];
        const urlPrice = params.get('price') || null;
        const urlPage = parseInt(params.get('page')) || 1;

        setFilters({ price: urlPrice, brands: urlBrands, categories: urlCategories });
        setCurrentPage(urlPage);
    }, [location.search]);
    
    // Effect để tải dữ liệu cho các bộ lọc (brands, categories)
    useEffect(() => {
        const fetchFilterData = async () => {
            setIsFiltersLoading(true);
            try {
                const [brandsData, categoriesData] = await Promise.all([
                    getAllBrands(),
                    getAllCategories()
                ]);
                setBrands(brandsData);
                setCategories(categoriesData);
            } catch (err) {
                setError(p => p || err.message);
            } finally {
                setIsFiltersLoading(false);
            }
        };
        fetchFilterData();
    }, []);

    // Effect để tải danh sách sản phẩm khi bộ lọc hoặc trang thay đổi
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null); 
        
        const params = new URLSearchParams({ 
            page: currentPage, 
            view: 'public' // Luôn đảm bảo chỉ lấy sản phẩm đã đăng bán
        });
        
        if (filters.price) params.append('price', filters.price);
        if (filters.brands.length > 0) params.append('brands', filters.brands.join(','));
        if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
        
        try {
            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) throw new Error('Không thể tải sản phẩm.');
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

    // Hàm xử lý khi người dùng thay đổi bộ lọc
    const handleFilterChange = (filterType, value) => {
        const params = new URLSearchParams(location.search);
        
        if (filterType === 'price') {
            if (params.get('price') === value) {
                params.delete('price');
            } else {
                params.set('price', value);
            }
        } else { // brands hoặc categories
            const currentValues = params.get(filterType)?.split(',').filter(Boolean) || [];
            if (currentValues.includes(value)) {
                const newValues = currentValues.filter(item => item !== value);
                if (newValues.length > 0) {
                    params.set(filterType, newValues.join(','));
                } else {
                    params.delete(filterType);
                }
            } else {
                params.set(filterType, [...currentValues, value].join(','));
            }
        }

        // Luôn reset về trang 1 khi bộ lọc thay đổi
        params.delete('page');
        // Cập nhật URL, việc này sẽ kích hoạt lại useEffect('location.search') để cập nhật state
        navigate({ search: params.toString() });
    };

    const handlePageChange = (pageNumber) => {
        const params = new URLSearchParams(location.search);
        params.set('page', pageNumber);
        navigate({ search: params.toString() });
    };

    // Hàm render một nhóm bộ lọc
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
                                            onClick={() => handleFilterChange('price', key)}
                                            checked={filters.price === key}
                                            onChange={() => {}}
                                        /> {label}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {isFiltersLoading ? (<p>Đang tải bộ lọc...</p>) : (
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
                                ) : ( <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p> )}
                            </div>
                            <nav className="pagination">
                                {pagination.totalPages > 1 &&
                                    Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNumber => (
                                        <button 
                                            key={pageNumber} 
                                            className={currentPage === pageNumber ? 'active' : ''} 
                                            onClick={() => handlePageChange(pageNumber)}
                                        >
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