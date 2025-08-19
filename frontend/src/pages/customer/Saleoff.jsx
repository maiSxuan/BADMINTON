import { useState, useMemo, useEffect } from 'react';
import './Saleoff.css';
import { fetchSaleProducts } from '../../services/index';
import { Link } from 'react-router-dom';

const discountLevels = ['20%', '30%', '40%', '50%', '60%', 'Trực tiếp'];
const priceRanges = {
    'range1': { label: "Dưới 500,000đ", min: 0, max: 499999 },
    'range2': { label: "500,000đ - 1,000,000đ", min: 500000, max: 1000000 },
    'range3': { label: "1,000,000đ - 2,000,000đ", min: 1000001, max: 2000000 },
    'range4': { label: "2,000,000đ - 3,000,000đ", min: 2000001, max: 3000000 },
    'range5': { label: "Trên 3,000,000đ", min: 3000001, max: Number.MAX_SAFE_INTEGER }
};

function SaleOffPage() {
    const [filters, setFilters] = useState({
        discountLevels: [],
        priceRanges: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSaleProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchSaleProducts();
                console.log('data from API:', data);

                if (!data || data.length === 0) {
                    setPromotions([]);
                    return;
                }

                setPromotions(data);

            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu chương trình giảm giá');
                setPromotions([]);
            } finally {
                setLoading(false);
            }
        };
        loadSaleProducts();
    }, []);

    const sortedPromotions = useMemo(() => {
        if (!promotions) return [];
        return [...promotions].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    }, [promotions]);

    const allProducts = useMemo(() => {
        if (!sortedPromotions || sortedPromotions.length === 0) return [];

        return sortedPromotions.flatMap(promo =>
            promo.products.map(product => ({
                ...product,
                promotionId: promo.promotion_id,
                promotionName: promo.promotion_name,
                discountType: product.discountType || null,
                discountValue: product.discountValue || 0,
            }))
        );
    }, [sortedPromotions]);

    const calcDiscountValue = (product) => {
        if (product.discountType === 'percentage') {
            return {
                type: 'percentage',
                value: product.discountValue || 0,
            };
        } else if (product.discountType === 'fixed') {
            return {
                type: 'fixed',
                value: product.discountValue || 0,
            };
        } else if (product.price && product.sale_price) {
            const percentOff = Math.floor(((product.price - product.sale_price) / product.price) * 100);
            return {
                type: 'percentage',
                value: percentOff,
            };
        }
        return {
            type: null,
            value: 0,
        };
    };

    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const { discountType, discountValue, price, sale_price } = product;

            if (filters.discountLevels.length > 0) {
                if (discountType === 'percentage') {
                    if (
                        filters.discountLevels.includes('Trực tiếp') ||
                        !filters.discountLevels.some(level => discountValue >= parseInt(level))
                    ) {
                        return false;
                    }
                } else if (discountType === 'fixed') {
                    if (!filters.discountLevels.includes('Trực tiếp')) {
                        return false;
                    }
                } else {
                    const percentOff = price && sale_price ? Math.floor(((price - sale_price) / price) * 100) : 0;
                    if (
                        filters.discountLevels.includes('Trực tiếp') ||
                        !filters.discountLevels.some(level => percentOff >= parseInt(level))
                    ) {
                        return false;
                    }
                }
            }

            if (filters.priceRanges) {
                const salePrice = sale_price ?? price ?? 0;
                const range = priceRanges[filters.priceRanges];
                if (!(salePrice >= range.min && salePrice < range.max)) return false;
            }

            return true;
        });
    }, [allProducts, filters]);

    const handleRadioClick = (key) => {
        setFilters(prev => ({
            ...prev,
            priceRanges: prev.priceRanges === key ? '' : key,
        }));
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const paginatedGroupedByPromotion = useMemo(() => {
        const groups = {};
        paginatedProducts.forEach(product => {
            if (!groups[product.promotionId]) {
                groups[product.promotionId] = [];
            }
            groups[product.promotionId].push(product);
        });
        return groups;
    }, [paginatedProducts]);

    const handleFilterChange = (filterName, isRadio = false) => (e) => {
        const { value, checked } = e.target;
        const currentValue = filters[filterName];

        if (isRadio) {
            // toggle radio: click lại option đang chọn => bỏ chọn
            const newValue = currentValue === value ? '' : value;
            setFilters(prev => ({ ...prev, [filterName]: newValue }));
        } else {
            // checkbox thêm/bớt trong mảng
            const currentValues = currentValue || [];
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter(item => item !== value);
            setFilters(prev => ({ ...prev, [filterName]: newValues }));
        }

        setCurrentPage(1);
    };

    const renderProductCard = (product) => {
        const discount = calcDiscountValue(product);

        let discountLabel = '';
        let badgeClass = 'saleoff-discount-badge';

        if (discount.type === 'percentage') {
            discountLabel = `Giảm ${discount.value}%`;
            badgeClass += ' saleoff-discount-percentage';
        } else if (discount.type === 'fixed') {
            discountLabel = `Giảm ${discount.value.toLocaleString('vi-VN')} ₫`;
            badgeClass += ' saleoff-discount-fixed';
        }

        return (
            <Link to={`/products/${product.slug}`} key={product._id} className="saleoff-product-card saleoff-sale-card" >
                <div className={badgeClass}>{discountLabel}</div>
                <img src={product.thumbnail_url} className='saleoff-product-image' alt={product.name} />
                <h4 className="saleoff-product-name">{product.name}</h4>
                <div className="saleoff-price-container">
                    <p className="saleoff-sale-price">{product.sale_price.toLocaleString('vi-VN')} ₫</p>
                    <p className="saleoff-original-price">{product.price.toLocaleString('vi-VN')} ₫</p>
                </div>
            </Link>
        );
    };

    function LoadingSpinner() {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    function ErrorMessage({ message }) {
        return (
            <div className="error-container">
                <p className="error-message">{message}</p>
            </div>
        );
    }

    function EmptyPromotion({ message }) {
        return (
            <div className="empty-promotion-wrapper">
                <div className="saleoff-no-products">
                    <div className="marquee-container">
                        <div className="marquee-content">
                            {/* <span className="marquee-icon">🎉</span> */}
                            <span className="marquee-text">{message}</span>
                            {/* <span className="marquee-icon">🎉</span> */}
                        </div>
                    </div>
                </div>

                <div className="static-message">
                    <div className="static-content">
                        <div className="message-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                    fill="#e91e63"
                                />
                            </svg>
                        </div>
                        <div className="message-text">
                            <h3>Coming soon</h3>
                            <p>Hãy theo dõi thường xuyên để không bỏ lỡ những ưu đãi hấp dẫn từ chúng tôi!</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!promotions.length) return <EmptyPromotion message="Hiện tại chúng tôi chưa có chương trình khuyến mãi. Xin vui lòng quay lại sau!"/>;

    return (
        <div className="sale-off-container">
            <div className="sale-off-layout">
                <aside className="saleoff-sidebar">
                    <div className="saleoff-filter-section">
                        <div className="saleoff-filter-group">
                            <h3>MỨC GIẢM GIÁ</h3>
                            <ul>
                                {discountLevels.map(level => (
                                    <li key={level}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value={level}
                                                onChange={handleFilterChange('discountLevels')}
                                                checked={filters.discountLevels.includes(level)}
                                            />
                                            {level}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="saleoff-filter-group">
                            <h3>CHỌN MỨC GIÁ</h3>
                            <ul>
                                {Object.keys(priceRanges).map(key => (
                                    <li key={key}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                value={key}
                                                checked={filters.priceRanges === key}
                                                onClick={() => handleRadioClick(key)}
                                            />
                                            {priceRanges[key].label}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </aside>

                <main className="saleoff-main-content">
                    {Object.entries(paginatedGroupedByPromotion).length > 0 ? (
                        <div className="saleoff-promotions-list">
                            {Object.entries(paginatedGroupedByPromotion).map(([promoId, products]) => {
                                const promo = sortedPromotions.find(p => p.promotion_id === promoId);
                                if (!promo) return null;

                                return (
                                    <div key={promoId} className="saleoff-promotion-group">
                                        <h2 className="saleoff-promotion-title">{promo.promotion_name}</h2>
                                        <div className="saleoff-products-grid">
                                            {products.map(product => renderProductCard(product))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="saleoff-no-products">
                            <p>Không tìm thấy sản phẩm phù hợp</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="saleoff-pagination">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    className={`saleoff-page-button ${currentPage === pageNumber ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default SaleOffPage;
