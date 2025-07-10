import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {delivery, quality, paying, exchange, saleVot, saleGiay, saleAo} from '../../assets/images/Homepage';
import chevronLeft from '../../assets/icons/ChevronLeft.svg';
import chevronRight from '../../assets/icons/ChevronRight.svg';
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
      name: "Vợt Cầu Lông Kumpoo JingZhou Chính Hãng",
      price: "930.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-kumpoo-jingzhou-chinh-hang_1742841785.webp",
      category: "VỢT CẦU LÔNG",
    },
    {
      id: 2,
      name: "Vợt cầu lông Lining Axforce Cannon",
      price: "980.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-lining-axforce-cannon-black-chinh-hang.webp",
      category: "VỢT CẦU LÔNG",
    },
    {
      id: 3,
      name: "Giày cầu lông Yonex SHB 65Z4 2025",
      price: "2.849.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/giay-cau-long-yonex-shb-65z4-slim-trang-2025-chinh-hang_1736970583.webp",
      category: "GIÀY CẦU LÔNG",
    },
    {
      id: 4,
      name: "Áo cầu lông Lining A533 nam - Trắng xanh",
      price: "130.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-lining-a533-nam-trang-xanh_1750363202.webp",
      category: "ÁO CẦU LÔNG",
    },
    {
      id: 5,
      name: "Quần cầu lông Mizuno 7050 - Đen",
      price: "130.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/quan-cau-long-mizuno-7050-den_1751244307.webp",
      category: "QUẦN CẦU LÔNG",
    },
    {
      id: 6,
      name: "Balo cầu lông Victor BR 7009",
      price: "750.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/balo-cau-long-victor-br-7009-trang-xanh-gc_1747880691.webp",
      category: "BALO CẦU LÔNG",
    },
    {
      id: 7,
      name: "Túi cầu lông Yonex BA31PAEX",
      price: "839.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/tui-cau-long-yonex-ba31paex-den-xanh-gc_1747879387.webp",
      category: "TÚI VỢT CẦU LÔNG",
    },
    {
      id: 8,
      name: "Dây cước căng vợt GOSEN Ryzonic 58 Pochaneco",
      price: "165.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/day-cuoc-cang-vot-gosen-ryzonic-58-pochaneco_1751075038.webp",
      category: "PHỤ KIỆN CẦU LÔNG",
    },
    {
      id: 9,
      name: "Băng chặn mồ hôi Victor SP507 DBZ O chính hãng",
      price: "100.000 ₫",
      image: "https://cdn.shopvnb.com/uploads/gallery/bang-chan-mo-hoi-victor-sp507-dbz-o-chinh-hang-1_1749083181.webp",
      category: "PHỤ KIỆN CẦU LÔNG",
    },
  ];

  const filterProducts = activeTab === "TẤT CẢ" 
    ? products 
    : products.filter((product) => product.category === activeTab);

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

  const handleTabClick = (category, e) => {
    setActiveTab(category);
    e.target.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  };

  const categoryRef = useRef(null);

  useEffect(() => {
    const slider = categoryRef.current;
    if (!slider) return;

    let isDragging = false;
    let startY = 0;
    let scrollStart = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      startY = e.pageY;
      scrollStart = slider.scrollTop;
      slider.style.userSelect = 'none';
      slider.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = e.pageY - startY;
      slider.scrollTop = scrollStart - deltaY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      slider.style.userSelect = '';
      slider.style.cursor = 'grab';
    };

    // const handleWheel = (e) => {
    //   if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    //     e.preventDefault();
    //     slider.scrollBy({ top: e.deltaY, behavior: 'smooth' });
    //   }
    // };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mouseleave', handleMouseUp);
    // slider.addEventListener('wheel', handleWheel, { passive: false });
    slider.style.cursor = 'grab';

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mousemove', handleMouseMove);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mouseleave', handleMouseUp);
      // slider.removeEventListener('wheel', handleWheel);
      slider.style.userSelect = '';
      slider.style.cursor = '';
    };
  }, []);

  const productGridRef = useRef(null);

  useEffect(() => {
    const slider = productGridRef.current;
    if (!slider)
        return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let rafId = null;

    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      slider.style.userSelect = 'none';
      slider.style.cursor = 'grabbing';
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.style.userSelect = '';
      slider.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDown)
        return;

      e.preventDefault();
      if (rafId)
        cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.2;
        slider.scrollLeft = scrollLeft - walk;
      });
    };

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        slider.scrollBy({
          left: e.deltaY,
          behavior: 'smooth',
        });
      }
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mouseleave", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove, { passive: false });
    slider.addEventListener("wheel", handleWheel, { passive: false });
    slider.style.cursor = 'grab';

    return () => {
      if (rafId)
        cancelAnimationFrame(rafId)

      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mouseleave", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
      slider.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const scrollAmountRef = useRef(300);

  useEffect(() => {
    if (productGridRef.current) {
      const firstCard = productGridRef.current.querySelector(".home-product-card");
      if (firstCard) {
        scrollAmountRef.current = firstCard.offsetWidth + 24;
      }
    }
  }, [filterProducts]);
  
  const scrollProductLeft = () => {
    productGridRef.current.scrollBy({ left: -scrollAmountRef.current, behavior: 'smooth' });
  };

  const scrollProductRight = () => {
    productGridRef.current.scrollBy({ left: scrollAmountRef.current, behavior: 'smooth' });
  };

  return (
    <div className="home-product-section">

      <section className="home-product-features">
        <div className="home-product-container">
          <div className="home-product-features-grid">
            <div className="home-product-features-item">
              <img src={delivery} alt="Vận chuyển" className="home-product-features-icon" />
              <div>
                <div className="home-product-features-title">Vận chuyển</div>
                <div className="home-product-features-title">TOÀN QUỐC</div>
              </div>
            </div>
            <div className="home-product-features-item">
              <img src={quality} alt="Chất lượng" className="home-product-features-icon" />
              <div>
                <div className="home-product-features-title">Bảo đảm sản phẩm</div>
                <div className="home-product-features-title">CHẤT LƯỢNG</div>
              </div>
            </div>
            <div className="home-product-features-item">
              <img src={paying} alt="Thanh toán" className="home-product-features-icon" />
              <div>
                <div className="home-product-features-title">Thanh toán</div>
                <div className="home-product-features-title">ĐA DẠNG</div>
              </div>
            </div>
            <div className="home-product-features-item">
              <img src={exchange} alt="Đổi trả" className="home-product-features-icon" />
              <div>
                <div className="home-product-features-title">Đổi sản phẩm mới</div>
                <div className="home-product-features-title">Nếu sản phẩm LỖI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-products">
        <div className="home-product-container">
          <div className="hp-section-title-wrapper">
            <h2 className="hp-section-title">Sản phẩm mới</h2>
            <div className="hp-section-underline underline-left"></div>
          </div>
          
          <div className="home-product-flex-container">
            <div className="hp-category-tabs-wrapper" ref={categoryRef}>
              <div className="hp-category-tabs">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`home-product-tab-button ${activeTab === category ? "active" : ""}`}
                    onClick={(e) => handleTabClick(category, e)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          
            <div className="home-product-grid-wrapper">
              <button className="scroll-product-button left" onClick={scrollProductLeft}>
                <img src={chevronLeft} alt="left" />
              </button>

              <div className="home-product-grid" ref={productGridRef}>
                { filterProducts.map((product) => (
                  <div key={product.id} className="home-product-card" onClick={() => handleProductClick(product.id)}>
                    <div className="product-image-container">
                      <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />
                    </div>
                    <div className="product-grid-info">
                      <p className="product-grid-name">{product.name}</p>
                      <p className="product-grid-price">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="scroll-product-button right" onClick={scrollProductRight}>
                <img src={chevronRight} alt="right" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-product-sale-off">
        <div className="home-product-container">
          <div className="hp-section-title-wrapper">
            <h2 className="hp-section-title">Sale off</h2>
            <div className="hp-section-underline underline-center"></div>
          </div>
          
          <div className="home-product-sale-grid">
            <NavLink to="/sale-vot" className="home-product-sale-card image-card" style={{ backgroundImage: `url(${saleVot})` }}>
              <h3 className="home-product-sale-title">VỢT CẦU LÔNG</h3>
              <p className="home-product-sale-title">20% OFF</p>
            </NavLink>

            <NavLink to="/sale-giay" className="home-product-sale-card image-card" style={{ backgroundImage: `url(${saleGiay})` }}>
              <h3 className="home-product-sale-title">GIẢM GIÁ</h3>
              <p className="home-product-sale-title">Giá ưu đãi</p>
            </NavLink>

            <NavLink to="/sale-ao" className="home-product-sale-card image-card" style={{ backgroundImage: `url(${saleAo})` }}>
              <h3 className="home-product-sale-title">SALE OFF</h3>
              <p className="home-product-sale-title">ÁO CẦU LÔNG</p>
            </NavLink>
          </div>
        </div>
      </section>

      <section className="home-product-category-section">
        <div className="home-product-container">
          <div className="hp-section-title-wrapper">
            <h2 className="hp-section-title">Sản phẩm cầu lông</h2>
            <div className="hp-section-underline underline-right"></div>
          </div>
          
          <div className="home-product-category-grid">
            {productCategories.map((category, index) => (
              <div key={index} className="home-product-category-card" onClick={() => handleCategoryClick(category.title)}>
                <div className="home-product-category-icon">{category.icon}</div>
                <h3 className="home-product-category-title">{category.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Product
