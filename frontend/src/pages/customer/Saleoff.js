// import { useState, useMemo, useEffect } from 'react';
// import './Saleoff.css';
// import { fetchSaleProducts } from '../../services/index';

// const discountLevels = ['20%', '30%', '40%', '50%', '60%', 'Trực tiếp'];
// const priceRanges = {
//     'range1': { min: 0, max: 500000, label: 'Giá dưới 500.000đ' },
//     'range2': { min: 500000, max: 1000000, label: '500.000đ - 1 triệu' },
//     'range3': { min: 1000000, max: 2000000, label: '1 - 2 triệu' },
//     'range4': { min: 2000000, max: 3000000, label: '2 - 3 triệu' },
//     'range5': { min: 3000000, max: Infinity, label: 'Giá trên 3 triệu' }
// };

// function SaleOffPage() {
//     const [filters, setFilters] = useState({
//         discountLevels: [],
//         priceRanges: [],
//     });
//     const [currentPage, setCurrentPage] = useState(1);
//     const productsPerPage = 8;

//     const [promotions, setPromotions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const loadSaleProducts = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const data = await fetchSaleProducts();
//                 setPromotions(data);
//             } catch (err) {
//                 setError('Lỗi khi tải sản phẩm');
//             } finally {
//                 setLoading(false)
//             }
//         };
//         loadSaleProducts();
//     }, []);

//     const allProducts = useMemo(() => {
//         if (!promotions || promotions.length === 0) return [];

//         return promotions.flatMap(promo =>
//             promo.products.map(product => ({
//                 ...product,
//                 promotionId: promo.promotion_id,
//                 promotionName: promo.promotion_name,
//                 discountType: product.discountType || null,
//                 discountValue: product.discountValue || 0,
//             }))
//         );
//     }, [promotions]);

//     const calcDiscountValue = (product) => {
//         if (product.discountType === 'percentage') {
//             return {
//                 type: 'percentage',
//                 value: product.discountValue || 0,
//             };
//         } else if (product.discountType === 'fixed') {
//             return {
//                 type: 'fixed',
//                 value: product.discountValue || 0,
//             };
//         } else if (product.price && product.sale_price) {
//             const percentOff = Math.floor(((product.price - product.sale_price) / product.price) * 100);
//             return {
//                 type: 'percentage',
//                 value: percentOff,
//             };
//         }
//         return {
//             type: null,
//             value: 0,
//         };
//     };


//     const filteredProducts = useMemo(() => {
//         return allProducts.filter(product => {
//             const { discountType, discountValue, price, sale_price } = product;

//             if (filters.discountLevels.length > 0) {
//                 if (discountType === 'percentage') {
//                     if (
//                         filters.discountLevels.includes('Trực tiếp') ||
//                         !filters.discountLevels.some(level => discountValue >= parseInt(level))
//                     ) {
//                         return false;
//                     }
//                 } else if (discountType === 'fixed') {
//                     if (!filters.discountLevels.includes('Trực tiếp')) {
//                         return false;
//                     }
//                 } else {
//                     const percentOff = price && sale_price ? Math.floor(((price - sale_price) / price) * 100) : 0;
//                     if (
//                         filters.discountLevels.includes('Trực tiếp') ||
//                         !filters.discountLevels.some(level => percentOff >= parseInt(level))
//                     ) {
//                         return false;
//                     }
//                 }
//             }

//             if (filters.priceRanges.length > 0) {
//                 const salePrice = sale_price ?? price ?? 0;
//                 const inPriceRange = filters.priceRanges.some(rangeKey => {
//                     const range = priceRanges[rangeKey];
//                     return salePrice >= range.min && salePrice < range.max;
//                 });
//                 if (!inPriceRange) return false;
//             }

//             return true;
//         });
//     }, [allProducts, filters]);

//     const filteredGroupedByPromotion = useMemo(() => {
//         const groups = {};
//         filteredProducts.forEach(product => {
//             if (!groups[product.promotionId]) {
//                 groups[product.promotionId] = [];
//             }
//             groups[product.promotionId].push(product);
//         });
//         return groups;
//     }, [filteredProducts]);

//     const sortedPromotions = useMemo(() => {
//         if (!promotions) return [];
//         return [...promotions].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
//     }, [promotions]);


//     const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
//     const startIndex = (currentPage - 1) * productsPerPage;
//     const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

//     const handleCheckboxChange = (filterName) => (e) => {
//         const { value, checked } = e.target;
//         const currentValues = filters[filterName];
//         const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
//         setFilters(prev => ({ ...prev, [filterName]: newValues }));
//         setCurrentPage(1);
//     };

//     const renderProductCard = (product) => {
//         const discount = calcDiscountValue(product);

//         let discountLabel = '';
//         if (discount.type === 'percentage') {
//             discountLabel = `Giảm ${discount.value}%`;
//         } else if (discount.type === 'fixed') {
//             discountLabel = `Giảm ${discount.value.toLocaleString('vi-VN')} ₫`;
//         }

//         return (
//             <div key={product._id} className="product-card sale-card">
//                 <div className="sale-tag">{discountLabel}</div>
//                 <img src={product.thumbnail_url} alt={product.name} />
//                 <h4 className="product-name">{product.name}</h4>
//                 <div className="price-container">
//                     <p className="sale-price">{product.sale_price.toLocaleString('vi-VN')} ₫</p>
//                     <p className="original-price">{product.price.toLocaleString('vi-VN')} ₫</p>
//                 </div>
//             </div>
//         );
//     };


//     if (loading) return <p>Đang tải dữ liệu...</p>;
//     if (error) return <p className="error-message">{error}</p>;
//     if (!promotions.length) return <p>Không tìm thấy sản phẩm giảm giá.</p>;

//     return (
//         <div className="container">
//             <main className="product-page-layout">
//                 <aside className="sidebar">
//                     <div className="filter-group">
//                         <h3>MỨC GIẢM GIÁ</h3>
//                         <ul>
//                             {discountLevels.map(level => (
//                                 <li key={level}>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value={level}
//                                             onChange={handleCheckboxChange('discountLevels')}
//                                             checked={filters.discountLevels.includes(level)}
//                                         /> {level}
//                                     </label>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>

//                     <div className="filter-group">
//                         <h3>CHỌN MỨC GIÁ</h3>
//                         <ul>
//                             {Object.keys(priceRanges).map(key => (
//                                 <li key={key}>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value={key}
//                                             onChange={handleCheckboxChange('priceRanges')}
//                                             checked={filters.priceRanges.includes(key)}
//                                         /> {priceRanges[key].label}
//                                     </label>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </aside>
//                 {/* <section className="product-content">
//                     <h1 className="page-title">SẢN PHẨM THANH LÝ</h1>
//                     <div className="product-grid">
//                         {paginatedProducts.length > 0 ? (
//                             paginatedProducts.map(product => renderProductCard(product))
//                         ) : (
//                             <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p>
//                         )}
//                     </div>

//                     {totalPages > 1 && (
//                         <nav className="pagination">
//                             {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
//                                 <button
//                                     key={pageNumber}
//                                     className={currentPage === pageNumber ? 'active' : ''}
//                                     onClick={() => setCurrentPage(pageNumber)}
//                                 >
//                                     {pageNumber}
//                                 </button>
//                             ))}
//                         </nav>
//                     )}
//                 </section> */}
//                 <section className="product-content">
//                     {Object.entries(filteredGroupedByPromotion).length > 0 ? (
//                         Object.entries(filteredGroupedByPromotion).map(([promoId, products]) => {
//                             const promo = promotions.find(p => p.promotion_id === promoId);
//                             if (!promo) return null;

//                             return (
//                                 <div key={promoId} className="promotion-group">
//                                     <h2 className="promotion-title">{promo.promotion_name}</h2>
//                                     <div className="product-grid">
//                                         {products.map(product => renderProductCard(product))}
//                                     </div>
//                                 </div>
//                             );
//                         })
//                     ) : (
//                         <p className="no-products">Không tìm thấy sản phẩm phù hợp.</p>
//                     )}

//                     {totalPages > 1 && (
//                         <nav className="pagination">
//                             {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
//                                 <button
//                                     key={pageNumber}
//                                     className={currentPage === pageNumber ? 'active' : ''}
//                                     onClick={() => setCurrentPage(pageNumber)}
//                                 >
//                                     {pageNumber}
//                                 </button>
//                             ))}
//                         </nav>
//                     )}
//                 </section>
//             </main>
//         </div>
//     );
// }

// export default SaleOffPage;

import { useState, useMemo, useEffect } from 'react';
import './Saleoff.css';
import { fetchSaleProducts } from '../../services/index';

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
        priceRanges: [],
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
                setPromotions(data);
            } catch (err) {
                setError('Lỗi khi tải sản phẩm');
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

            if (filters.priceRanges.length > 0) {
                const salePrice = sale_price ?? price ?? 0;
                const inPriceRange = filters.priceRanges.some(rangeKey => {
                    const range = priceRanges[rangeKey];
                    return salePrice >= range.min && salePrice < range.max;
                });
                if (!inPriceRange) return false;
            }

            return true;
        });
    }, [allProducts, filters]);

    // const filteredGroupedByPromotion = useMemo(() => {
    //     const groups = {};
    //     filteredProducts.forEach(product => {
    //         if (!groups[product.promotionId]) {
    //             groups[product.promotionId] = [];
    //         }
    //         groups[product.promotionId].push(product);
    //     });
    //     return groups;
    // }, [filteredProducts]);

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


    // const handleCheckboxChange = (filterName) => (e) => {
    //     const { value, checked } = e.target;
    //     const currentValues = filters[filterName];
    //     const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
    //     setFilters(prev => ({ ...prev, [filterName]: newValues }));
    //     setCurrentPage(1);
    // };
    const handleFilterChange = (filterName, isRadio = false) => (e) => {
        const { value, checked } = e.target;
        const currentValues = filters[filterName];

        let newValues;
        if (isRadio) {
            if (checked) {
                newValues = [value]; 
            } else {
                newValues = [];
            }
        } else {
            newValues = checked
                ? [...currentValues, value]
                : currentValues.filter(item => item !== value);
        }

        setFilters(prev => ({ ...prev, [filterName]: newValues }));
        setCurrentPage(1);
    };


    const renderProductCard = (product) => {
        const discount = calcDiscountValue(product);

        let discountLabel = '';
        if (discount.type === 'percentage') {
            discountLabel = `Giảm ${discount.value}%`;
        } else if (discount.type === 'fixed') {
            discountLabel = `Giảm ${discount.value.toLocaleString('vi-VN')} ₫`;
        }

        return (
            <div key={product._id} className="saleoff-product-card saleoff-sale-card">
                <div className="saleoff-discount-badge">{discountLabel}</div>
                <img src={product.thumbnail_url} className='saleoff-product-image' alt={product.name} />
                <h4 className="saleoff-product-name">{product.name}</h4>
                <div className="saleoff-price-container">
                    <p className="saleoff-sale-price">{product.sale_price.toLocaleString('vi-VN')} ₫</p>
                    <p className="saleoff-original-price">{product.price.toLocaleString('vi-VN')} ₫</p>
                </div>
            </div>
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

    function EmptyMessage({ message }) {
        return (
            <div className="empty-container">
                <p>{message}</p>
            </div>
        );
    }


    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!promotions.length) return <EmptyMessage message="Không tìm thấy sản phẩm giảm giá." />;

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
                                                onChange={handleFilterChange('priceRanges', true)}
                                                checked={filters.priceRanges.includes(key)}
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
