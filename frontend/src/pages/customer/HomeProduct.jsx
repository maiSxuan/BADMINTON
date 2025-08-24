// src/components/HomeProduct.js

import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import "./HomeProduct.css";
import { getProductsOnQuery, getAllCategories } from "../../services";
import {
  delivery,
  exchange,
  quality,
  paying,
  saleAo,
  saleVot,
  saleGiay,
} from "../../assets/images/Homepage";

const HomeProduct = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState({ name: "TẤT CẢ", slug: "" });
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Lấy danh sách ngành hàng
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setDynamicCategories(categoriesData);
      } catch (err) {
        console.error("Lỗi khi tải danh sách ngành hàng:", err);
      }
    };
    fetchAllCategories();
  }, []);

  // Lấy sản phẩm mới
  const fetchNewestProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const queryParams = {
      sort: "newest",
      limit: 20,
    };

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

  useEffect(() => {
    fetchNewestProducts();
  }, [fetchNewestProducts]);

  // Xử lý scroll kéo thả cho tab danh mục
  const scrollRef = useRef(null);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="product-section">
      {/* Features Section */}
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

      {/* Products Section */}
      <section className="products">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Sản phẩm mới</h2>
            <div className="section-underline underline-left"></div>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs-wrapper">
            <div className="category-tabs" ref={scrollRef}>
              <button
                className={`tab-button ${
                  activeTab.slug === "" ? "active" : ""
                }`}
                onClick={() => setActiveTab({ name: "TẤT CẢ", slug: "" })}
              >
                TẤT CẢ
              </button>

              {dynamicCategories.map((category) => (
                <button
                  key={category.slug}
                  className={`tab-button ${
                    activeTab.slug === category.slug ? "active" : ""
                  }`}
                  onClick={() =>
                    setActiveTab({
                      name: category.name.toUpperCase(),
                      slug: category.slug,
                    })
                  }
                >
                  {category.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="homepage-product-grid">
            {isLoading ? (
              <p className="homepage-grid-message">Đang tải sản phẩm...</p>
            ) : error ? (
              <p className="homepage-grid-message">{error}</p>
            ) : products.length > 0 ? (
              products.map((product) => (
                <NavLink
                  to={`/products/${product.slug}`}
                  key={product.id}
                  className="homepage-product-card"
                >
                  <div className="homepage-product-image-wrapper">
                    <img
                      src={
                        product.imageUrl ||
                        "https://via.placeholder.com/250?text=No+Image"
                      }
                      alt={product.name}
                      className="homepage-product-image"
                    />
                  </div>
                  <div className="homepage-product-info">
                    <h4 className="homepage-product-name">{product.name}</h4>
                    <p className="homepage-product-price">
                      {product.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </NavLink>
              ))
            ) : (
              <p className="homepage-grid-message">
                Không có sản phẩm nào trong danh mục này.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Sale Off Section */}
      <section className="sale-off">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Sale off</h2>
            <div className="section-underline underline-center"></div>
          </div>

          <div className="sale-grid">
            <NavLink
              to="/sale"
              className="sale-card image-card"
              style={{ backgroundImage: `url(${saleVot})` }}
            ></NavLink>

            <NavLink
              to="/sale"
              className="sale-card image-card"
              style={{ backgroundImage: `url(${saleAo})` }}
            ></NavLink>

            <NavLink
              to="/sale"
              className="sale-card image-card"
              style={{ backgroundImage: `url(${saleGiay})` }}
            ></NavLink> 
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="category-section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Sản phẩm cầu lông</h2>
            <div className="section-underline underline-right"></div>
          </div>

          <div className="category-grid-container">
            <div className="category-grid">
              {dynamicCategories.map((category) => (
                <NavLink
                  to={`/products?categories=${category.slug}`}
                  key={category.slug}
                  className="category-card"
                >
                  <h3 className="category-title">
                    {category.name.toUpperCase()}
                  </h3>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeProduct;
