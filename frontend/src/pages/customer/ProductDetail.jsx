import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProductData = async () => {
            if (!slug) {
                setLoading(false);
                setError("Không tìm thấy slug sản phẩm.");
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:4000/api/products/${slug}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
                }
                const data = await response.json();
                setProduct(data);
                if (data.variants && data.variants.length > 0) {
                    const initialVariant = data.variants[0];
                    setSelectedVariant(initialVariant);
                    setMainImage(initialVariant.images[0]);
                }
                setError('');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadProductData();
    }, [slug]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setMainImage(variant.images[0]);
        setSelectedSize('');
    };

    const handleThumbnailClick = (imageUrl) => setMainImage(imageUrl);

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    if (loading) return <p className="status-message">Đang tải sản phẩm...</p>;
    if (error) return <p className="status-message error">Lỗi: {error}</p>;
    if (!product || !selectedVariant) return <p className="status-message">Không tìm thấy sản phẩm.</p>;

    const isOutOfStock = selectedVariant.options.every(o => o.stock_quantity === 0);

    return (
        <div className="page-container">
            <div className="product-detail-container">
                <div className="product-gallery-section">
                    <div className="main-image-container">
                        <img src={mainImage} alt={`${product.name} - ${selectedVariant.name}`} className="main-image" />
                    </div>
                    <div className="thumbnail-list">
                        {selectedVariant.images.map((img, index) => (
                            <div key={index} className={`thumbnail-item ${img === mainImage ? 'active' : ''}`} onClick={() => handleThumbnailClick(img)}>
                                <img src={img} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="product-info-section">
                    <div className="product-meta">
                        <span>Mã: {product.slug}</span>
                        <span>Thương hiệu: {product.brand}</span>
                        <span style={{ color: isOutOfStock ? 'red' : 'green' }}>
                            Tình trạng: {isOutOfStock ? 'Tạm hết hàng' : 'Còn hàng'}
                        </span>
                    </div>
                    <h1 className="product-name">{product.name}</h1>
                    <div className="price-container">
                        <span className="current-price">{selectedVariant.price.toLocaleString('vi-VN')}₫</span>
                        <span className="list-price">{selectedVariant.list_price.toLocaleString('vi-VN')}₫</span>
                    </div>

                    <p className="selector-label">Chọn [Màu sắc]:</p>
                    <div className="variant-options">
                        {product.variants.map((variant) => (
                            <button key={variant.variant_id?.$oid || variant.variant_id} className={`variant-option ${variant.variant_id?.$oid === selectedVariant.variant_id?.$oid ? 'active' : ''}`} onClick={() => handleVariantSelect(variant)}>
                                <img src={variant.thumbnail_url} alt={variant.name} />
                                <div className="variant-info">
                                    <span>{variant.name}</span>
                                    <span>{variant.price.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="selector-label">Chọn [Size]:</p>
                    <div className="size-options">
                        {selectedVariant.options.map((option) => (
                            <button key={option.sku_code} className={`size-option ${option.size === selectedSize ? 'active' : ''}`} disabled={option.stock_quantity === 0} onClick={() => setSelectedSize(option.size)}>
                                {option.size}
                            </button>
                        ))}
                    </div>

                    <p className="selector-label">Số lượng:</p>
                    <div className="quantity-selector">
                        <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
                        <input type="number" className="quantity-input" value={quantity} readOnly />
                        <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
                    </div>

                    <div className="action-buttons">
                        <button className="action-btn buy-now-btn">Mua ngay</button>
                        <button className="action-btn add-to-cart-btn">Thêm vào giỏ hàng</button>
                    </div>
                </div>
            </div>
            
            {product.description && (
                <div className="product-description-section">
                    <h2 className="description-title">Mô tả sản phẩm</h2>
                    <div className="description-content">
                        {product.description}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;