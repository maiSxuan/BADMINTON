import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProductDetail.css'; 

const ProductDetail = () => {
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State để quản lý tương tác của người dùng
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:4000/api/products/${id}`);
        
        if (data.success) {
          setProduct(data.product);
          setVariants(data.variants);

          // Tự động chọn biến thể đầu tiên làm mặc định
          if (data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
            // Đặt ảnh chính là ảnh đầu tiên của biến thể mặc định
            setMainImage(data.variants[0].product_image[0]);
          } else {
            // Nếu không có biến thể, lấy ảnh chính của sản phẩm
            setMainImage(data.product.main_image);
          }
        }
      } catch (err) {
        setError('Không thể tải chi tiết sản phẩm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setMainImage(variant.product_image[0]); // Cập nhật ảnh chính khi chọn variant mới
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount)); // Không cho số lượng < 1
  };
  
  const handleAddToCart = () => {
      if (!selectedVariant) {
          alert('Vui lòng chọn một phân loại sản phẩm!');
          return;
      }
      console.log({
          productId: product._id,
          variantId: selectedVariant._id,
          sku: selectedVariant.SKU,
          name: selectedVariant.name,
          price: selectedVariant.price,
          quantity: quantity,
      });
      alert(`Đã thêm ${quantity} sản phẩm "${selectedVariant.name}" vào giỏ hàng!`);
  }

  if (loading) return <p className="status-text">Đang tải...</p>;
  if (error) return <p className="status-text">{error}</p>;
  if (!product) return <p className="status-text">Không tìm thấy sản phẩm.</p>;

  return (
    <div className="product-detail-container">
      <div className="product-main-content">
        {/* CỘT BÊN TRÁI - HÌNH ẢNH */}
        <div className="product-images">
          <div className="main-image-container">
            <img src={mainImage} alt="Main product" className="main-image" />
          </div>
          <div className="thumbnail-container">
            {selectedVariant && selectedVariant.product_image.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail-image ${imgUrl === mainImage ? 'active' : ''}`}
                onClick={() => setMainImage(imgUrl)}
              />
            ))}
          </div>
        </div>

        {/* CỘT BÊN PHẢI - THÔNG TIN VÀ LỰA CHỌN */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          
          {selectedVariant ? (
            <p className="product-price">{selectedVariant.price.toLocaleString('vi-VN')} đ</p>
          ) : (
             <p className="product-price">Vui lòng chọn một phiên bản</p>
          )}

          <div className="variant-selection">
            <p className="selection-title">Chọn [Màu sắc]:</p>
            <div className="variant-options">
              {variants.map((variant) => (
                <button
                  key={variant._id}
                  className={`variant-btn ${selectedVariant?._id === variant._id ? 'active' : ''}`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="quantity-selection">
             <p className="selection-title">Số lượng:</p>
             <div className="quantity-control">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange(1)}>+</button>
             </div>
          </div>

          <div className="action-buttons">
            <button className="btn-add-to-cart" onClick={handleAddToCart}>THÊM VÀO GIỎ HÀNG</button>
            <button className="btn-buy-now">MUA NGAY</button>
          </div>
        </div>
      </div>

      <div className="product-description-section">
        <h3>MÔ TẢ SẢN PHẨM</h3>
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
      </div>
    </div>
  );
};

export default ProductDetail;