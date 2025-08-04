// src/components/HomeProduct.js

import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import "./HomeProduct.css";
// Import thêm service `getAllCategories`
import { getProductsOnQuery, getAllCategories } from "../../services";

const HomeProduct = () => {
    // State cho sản phẩm, tab đang chọn, loading, và lỗi
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState({ name: "TẤT CẢ", slug: "" });

    // State mới để lưu trữ danh sách category động từ API
    const [dynamicCategories, setDynamicCategories] = useState([]);

    // useEffect để lấy danh sách categories một lần duy nhất khi component mount
    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const categoriesData = await getAllCategories();
                setDynamicCategories(categoriesData);
            } catch (err) {
                console.error("Lỗi khi tải danh sách ngành hàng:", err);
                // Bạn có thể hiển thị một thông báo lỗi cho người dùng nếu cần
            }
        };
        fetchAllCategories();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    // Hàm gọi API để lấy sản phẩm dựa trên tab đang được chọn
    const fetchNewestProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        // Tạo query params cho API
        const queryParams = {
            sort: 'newest',
            limit: 8,
        };

        // Chỉ thêm param 'categories' nếu không phải là tab "TẤT CẢ"
        if (activeTab.slug) {
            queryParams.categories = activeTab.slug;
        }

        try {
            const result = await getProductsOnQuery(queryParams);
            setProducts(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    // Gọi lại API sản phẩm mỗi khi activeTab thay đổi
    useEffect(() => {
        fetchNewestProducts();
    }, [fetchNewestProducts]);

    // Logic kéo thả cho thanh tab (giữ nguyên không đổi)
    const scrollRef = useRef(null);
    useEffect(() => {
        const slider = scrollRef.current;
        if (!slider) return;
        // ... (Toàn bộ code kéo thả của bạn ở đây)
    }, []);

    return (
        <div className="product-section">
            {/* Features Section (Giữ nguyên không đổi) */}
            <section className="features">
                {/* ... */}
            </section>

            {/* Products Section */}
            <section className="products">
                <div className="container">
                    <div className="section-title-wrapper">
                        <h2 className="section-title">Sản phẩm mới</h2>
                        <div className="section-underline underline-left"></div>
                    </div>
                    
                    {/* --- BỘ LỌC SẢN PHẨM (ĐÃ ĐƯỢC LÀM ĐỘNG) --- */}
                    <div className="category-tabs-wrapper">
                        <div className="category-tabs" ref={scrollRef}>
                            {/* Nút "TẤT CẢ" được thêm vào một cách tĩnh */}
                            <button
                                className={`tab-button ${activeTab.slug === "" ? "active" : ""}`}
                                onClick={() => setActiveTab({ name: "TẤT CẢ", slug: "" })}
                            >
                                TẤT CẢ
                            </button>
                            {/* Render các tab còn lại từ dữ liệu API */}
                            {dynamicCategories.map((category) => (
                                <button
                                    key={category.slug}
                                    className={`tab-button ${activeTab.slug === category.slug ? "active" : ""}`}
                                    onClick={() => setActiveTab({ name: category.name.toUpperCase(), slug: category.slug })}
                                >
                                    {category.name.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Lưới sản phẩm (giữ nguyên) */}
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

            {/* Sale Off Section (Giữ nguyên không đổi) */}
            <section className="sale-off">
                {/* ... */}
            </section>

            {/* --- LƯỚI DANH MỤC (ĐÃ ĐƯỢC LÀM ĐỘNG) --- */}
            <section className="category-section">
                <div className="container">
                    <div className="section-title-wrapper">
                        <h2 className="section-title">Sản phẩm cầu lông</h2>
                        <div className="section-underline underline-right"></div>
                    </div>
                    
                    {/* --- THÊM LẠI THẺ DIV CONTAINER Ở ĐÂY --- */}
                    <div className="category-grid-container">
                        <div className="category-grid">
                            {dynamicCategories.map((category) => (
                              <NavLink to={`/products?categories=${category.slug}`} key={category.slug} className="category-card">
                                  <h3 className="category-title">{category.name.toUpperCase()}</h3>
                              </NavLink>
                            ))}
                        </div>
                    </div>
                    
                </div>
            </section>
        </div>
    )
}

export default HomeProduct;