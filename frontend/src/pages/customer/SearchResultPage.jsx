import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getProductsOnQuery } from '../../services';
import './ProductPage.css'; // Tái sử dụng CSS của trang Product
import Pagination from '../../components/common/Pagination'; // Import component Pagination

// Component riêng cho card sản phẩm để tái sử dụng
const ProductCard = ({ product }) => (
    <Link to={`/products/${product.slug}`} className="product-card">
        <img src={product.imageUrl || '/logo192.png'} alt={product.name} />
        <h4>{product.name}</h4>
        <p className="price">{product.price.toLocaleString('vi-VN')} ₫</p>
    </Link>
);

const SearchResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // State cho dữ liệu
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy từ khóa và trang hiện tại từ URL
    const { searchTerm, currentPage } = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            searchTerm: params.get('q') || '',
            currentPage: parseInt(params.get('page')) || 1
        };
    }, [location.search]);

    useEffect(() => {
        if (searchTerm) {
            const fetchResults = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const queryParams = { 
                        search: searchTerm, 
                        page: currentPage,
                        limit: 20 // Giới hạn 20 sản phẩm mỗi trang
                    };
                    const result = await getProductsOnQuery(queryParams);
                    setProducts(result.data);
                    setPagination(result.pagination);
                } catch (err) {
                    setError(err.message);
                    setProducts([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResults();
        } else {
            setProducts([]);
            setIsLoading(false);
        }
    }, [searchTerm, currentPage]);

    // Hàm xử lý khi người dùng chuyển trang
    const handlePageChange = (pageNumber) => {
        const params = new URLSearchParams(location.search);
        params.set('page', pageNumber);
        navigate({ search: params.toString() });
    };

    return (
        <div className="container" style={{paddingTop: '20px', paddingBottom: '40px'}}>
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#6b7280' }}>
                <Link to="/" style={{textDecoration: 'none', color: '#6b7280'}}>Trang chủ</Link>
                {' › '}
                <span>Tìm kiếm</span>
            </div>
            
            <h1 className="search-page-title" style={{ fontSize: '28px', marginBottom: '32px' }}>
                Kết quả tìm kiếm cho: "{searchTerm}"
            </h1>

            <section className="product-content">
                {isLoading ? <p>Đang tìm kiếm...</p> : 
                 error ? <p className="no-products">{error}</p> : 
                 (
                    <>
                        <div className="product-grid">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="no-products">Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.</p>
                            )}
                        </div>
                        
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                 )}
            </section>
        </div>
    );
};

export default SearchResultPage;