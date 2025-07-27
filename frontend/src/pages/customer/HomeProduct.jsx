// src/components/HomeProduct.js (Hoặc đường dẫn tương ứng của bạn)

import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { delivery, quality, paying, exchange, saleVot, saleGiay, saleAo } from '../../assets/images/Homepage';
import "./HomeProduct.css";

// Dữ liệu cho các tab lọc, có slug để gọi API
const categoryTabsData = [
    { name: "TẤT CẢ", slug: "" },
    { name: "VỢT CẦU LÔNG", slug: "vot-cau-long" },
    { name: "GIÀY CẦU LÔNG", slug: "giay-cau-long" },
    { name: "ÁO CẦU LÔNG", slug: "ao-cau-long" },
    { name: "QUẦN CẦU LÔNG", slug: "quan-cau-long" },
    { name: "BALO CẦU LÔNG", slug: "balo-cau-long" },
    { name: "TÚI VỢT CẦU LÔNG", slug: "tui-vot-cau-long" },
    { name: "PHỤ KIỆN CẦU LÔNG", slug: "phu-kien-cau-long" },
];

// Dữ liệu cho lưới danh mục ở cuối trang, có slug để điều hướng
const productCategoriesGrid = [
    { title: "VỢT CẦU LÔNG", icon: "🏸", slug: "vot-cau-long" },
    { title: "GIÀY CẦU LÔNG", icon: "👟", slug: "giay-cau-long" },
    { title: "ÁO CẦU LÔNG", icon: "👕", slug: "ao-cau-long" },
    { title: "QUẦN CẦU LÔNG", icon: "🩳", slug: "quan-cau-long" },
    { title: "VÁY CẦU LÔNG", icon: "👗", slug: "vay-cau-long" },
    { title: "BALO CẦU LÔNG", icon: "🎒", slug: "balo-cau-long" },
    { title: "TÚI VỢT CẦU LÔNG", icon: "👜", slug: "tui-vot-cau-long" },
    { title: "PHỤ KIỆN CẦU LÔNG", icon: "⚙️", slug: "phu-kien-cau-long" },
];

const HomeProduct = () => {
    // State để quản lý dữ liệu sản phẩm từ API
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState({ name: "TẤT CẢ", slug: "" });

    // Hàm gọi API để lấy 8 sản phẩm mới nhất, có thể lọc theo danh mục
    const fetchNewestProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
            sort: 'newest',
            limit: 8,
        });

        if (activeTab.slug) {
            params.append('categories', activeTab.slug);
        }

        try {
            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) throw new Error('Không thể tải sản phẩm.');
            const result = await response.json();
            setProducts(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchNewestProducts();
    }, [fetchNewestProducts]);

    // Logic kéo thả cho thanh tab (giữ nguyên từ code gốc của bạn)
    const scrollRef = useRef(null);
    useEffect(() => {
        const slider = scrollRef.current;
        if (!slider) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const handleMouseDown = (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        }

        const handleMouseLeave = () => {
            isDown = false;
            slider.classList.remove('active');
        }

        const handleMouseUp = () => {
            isDown = false;
            slider.classList.remove('active');
        }

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.2;
            slider.scrollLeft = scrollLeft - walk;
        }

        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeave);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mousemove', handleMouseMove);

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseLeave);
            slider.removeEventListener('mouseup', handleMouseUp);
            slider.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="product-section">
            {/* Features Section (Nội dung gốc) */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <img src={delivery} alt="Vận chuyển" className="feature-icon" />
                            <div>
                                <div className="feature-title">Vận chuyển</div>
                                <div className="feature-subtitle">TOÀN QUỐC</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <img src={quality} alt="Chất lượng" className="feature-icon" />
                            <div>
                                <div className="feature-title">Bảo đảm sản phẩm</div>
                                <div className="feature-subtitle">CHẤT LƯỢNG</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <img src={paying} alt="Thanh toán" className="feature-icon" />
                            <div>
                                <div className="feature-title">Thanh toán</div>
                                <div className="feature-subtitle">ĐA DẠNG</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <img src={exchange} alt="Đổi trả" className="feature-icon" />
                            <div>
                                <div className="feature-title">Đổi sản phẩm mới</div>
                                <div className="feature-subtitle">Nếu sản phẩm LỖI</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section (Nội dung được cập nhật với dữ liệu thật) */}
            <section className="products">
                <div className="container">
                    <div className="section-title-wrapper">
                        <h2 className="section-title">Sản phẩm mới</h2>
                        <div className="section-underline underline-left"></div>
                    </div>
                    
                    <div className="category-tabs-wrapper">
                        <div className="category-tabs" ref={scrollRef}>
                            {categoryTabsData.map((category) => (
                                <button
                                    key={category.name}
                                    className={`tab-button ${activeTab.name === category.name ? "active" : ""}`}
                                    onClick={() => setActiveTab(category)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="homepage-product-grid">
                        {isLoading ? (
                            <p className="homepage-grid-message">Đang tải sản phẩm...</p>
                        ) : error ? (
                            <p className="homepage-grid-message">{error}</p>
                        ) : (
                            products.length > 0 ? (
                                products.map((product) => (
                                    <NavLink to={`/products/${product.slug}`} key={product.id} className="homepage-product-card">
                                        <div className="homepage-product-image-wrapper">
                                            <img 
                                                src={product.imageUrl || 'https://via.placeholder.com/250?text=No+Image'} 
                                                alt={product.name} 
                                                className="homepage-product-image"
                                            />
                                        </div>
                                        <div className="homepage-product-info">
                                            <h4 className="homepage-product-name">{product.name}</h4>
                                            <p className="homepage-product-price">{product.price.toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </NavLink>
                                ))
                            ) : (
                                <p className="homepage-grid-message">Không có sản phẩm nào trong danh mục này.</p>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* Sale Off Section (Nội dung gốc) */}
            <section className="sale-off">
                <div className="container">
                    <div className="section-title-wrapper">
                        <h2 className="section-title">Sale off</h2>
                        <div className="section-underline underline-center"></div>
                    </div>
                    
                    <div className="sale-grid">
                        <NavLink to="/sale-vot" className="sale-card image-card" style={{ backgroundImage: `url(${saleVot})` }}>
                            <h3 className="sale-title">VỢT CẦU LÔNG</h3>
                            <p className="sale-subtitle">20% OFF</p>
                        </NavLink>

                        <NavLink to="/sale-giay" className="sale-card image-card" style={{ backgroundImage: `url(${saleGiay})` }}>
                            <h3 className="sale-title">GIẢM GIÁ</h3>
                            <p className="sale-subtitle">Giá ưu đãi</p>
                        </NavLink>

                        <NavLink to="/sale-ao" className="sale-card image-card" style={{ backgroundImage: `url(${saleAo})` }}>
                            <h3 className="sale-title">SALE OFF</h3>
                            <p className="sale-subtitle">ÁO CẦU LÔNG</p>
                        </NavLink>
                    </div>
                </div>
            </section>

            {/* Product Categories Grid (Nội dung gốc) */}
            <section className="category-section">
                <div className="container">
                    <div className="section-title-wrapper">
                        <h2 className="section-title">Sản phẩm cầu lông</h2>
                        <div className="section-underline underline-right"></div>
                    </div>
                    
                    <div className="category-grid">
                        {productCategoriesGrid.map((category) => (
                          <NavLink to={`/products?categories=${category.slug}`} key={category.slug} className="category-card">
                              <div className="category-icon">{category.icon}</div>
                              <h3 className="category-title">{category.title}</h3>
                          </NavLink>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomeProduct;