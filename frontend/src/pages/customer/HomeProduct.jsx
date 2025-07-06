import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {delivery, quality, paying, exchange, saleVot, saleGiay, saleAo} from '../../assets/images/Homepage';
import "./HomeProduct.css";

const Product = () => {
  const [activeTab, setActiveTab] = useState("TẤT CẢ")

  const categories = [
    "TẤT CẢ",
    "VỢT CẦU LÔNG",
    "GIÀY CẦU LÔNG",
    "ÁO CẦU LÔNG",
    "QUẦN CẦU LÔNG",
    "BALO CẦU LÔNG",
    "TÚI VỢT CẦU LÔNG",
    "PHỤ KIỆN CẦU LÔNG",
  ]

  const products = [
    {
      id: 1,
      name: "Vợt Cầu Lông Kumpoo YangZhou Chính Hãng",
      price: "930.000 ₫",
      image: "https://via.placeholder.com/200x200?text=Racket+1",
    },
    {
      id: 2,
      name: "Vợt cầu lông Lining Axforce Cannon",
      price: "980.000 ₫",
      image: "https://via.placeholder.com/200x200?text=Racket+2",
    },
    {
      id: 3,
      name: "Vợt cầu lông Victor Thruster Ryuga II TD chính hãng",
      price: "3.100.000 ₫",
      image: "https://via.placeholder.com/200x200?text=Racket+3",
    },
    {
      id: 4,
      name: "Vợt cầu lông Lining Axforce 90 New - Lời Kênh Yew 2025",
      price: "4.349.000 ₫",
      image: "https://via.placeholder.com/200x200?text=Racket+4",
    },
  ]

  const productCategories = [
    { title: "VỢT CẦU LÔNG", icon: "🏸" },
    { title: "GIÀY CẦU LÔNG", icon: "👟" },
    { title: "ÁO CẦU LÔNG", icon: "👕" },
    { title: "QUẦN CẦU LÔNG", icon: "🩳" },
    { title: "VÂY CẦU LÔNG", icon: "👗" },
    { title: "BALO CẦU LÔNG", icon: "🎒" },
    { title: "TÚI VỢT CẦU LÔNG", icon: "👜" },
    { title: "PHỤ KIỆN CẦU LÔNG", icon: "⚙️" },
  ]

  const handleProductClick = (productId) => {
    console.log("Clicked product:", productId)
  }

  const handleCategoryClick = (category) => {
    console.log("Clicked category:", category)
  }

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
          
          {/* Product Categories Tabs */}
          <div className="category-tabs-wrapper">
            <div className="category-tabs" ref={scrollRef}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`tab-button ${activeTab === category ? "active" : ""}`}
                  onClick={() => setActiveTab(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
                <div className="product-image-container">
                  <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price}</p>
              </div>
            ))}
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

      {/* Product Categories Grid */}
      <section className="category-section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Sản phẩm cầu lông</h2>
            <div className="section-underline underline-right"></div>
          </div>
          
          <div className="category-grid">
            {productCategories.map((category, index) => (
              <div key={index} className="category-card" onClick={() => handleCategoryClick(category.title)}>
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-title">{category.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Product
