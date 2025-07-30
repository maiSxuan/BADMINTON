import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css'; // File CSS của bạn

const API_URL = 'http://localhost:4000/api';

const ReviewItem = ({ review }) => (
    <div className="review-item">
        <div className="review-author">
            <div className="author-info">
                <span className="author-name">{review.user?.name || 'Người dùng ẩn danh'}</span>
                <div className="review-rating">
                    {'⭐'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                </div>
            </div>
        </div>
        <p className="review-comment">{review.comment}</p>
        <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
    </div>
);

const ProductDetailPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [totalReviewCount, setTotalReviewCount] = useState(0);
    const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

    useEffect(() => {
        const loadProductData = async () => {
            if (!slug) {
                setError("Không tìm thấy slug sản phẩm.");
                setLoading(false);
                return;
            }
            try {
                // Đặt lại state khi slug thay đổi để tránh hiển thị dữ liệu cũ
                setLoading(true);
                setProduct(null);
                setReviews([]);

                const response = await fetch(`${API_URL}/products/${slug}`);
                if (!response.ok) {
                    throw new Error(`Sản phẩm không tồn tại hoặc có lỗi xảy ra.`);
                }
                const data = await response.json();
                setProduct(data); // Cập nhật state product

                // *** SỬA LỖI 1: SỬ DỤNG BIẾN CỤC BỘ 'data' THAY VÌ STATE 'product' ***
                // Chỉ gọi API reviews KHI VÀ CHỈ KHI 'data' (kết quả fetch) có _id
                if (data && data._id) { 
                    try {
                        setReviewsLoading(true);
                        // Dùng data._id để đảm bảo luôn có giá trị
                        const reviewsResponse = await fetch(`${API_URL}/ratings/product/${data._id}?limit=3`);
                        if (reviewsResponse.ok) {
                            const reviewsData = await reviewsResponse.json();
                            setReviews(reviewsData.reviews || []); 
                            setTotalReviewCount(reviewsData.totalCount || 0);
                        }
                    } catch (reviewError) {
                        console.error("Lỗi khi tải đánh giá:", reviewError);
                    } finally {
                        setReviewsLoading(false);
                    }
                } else {
                    setReviewsLoading(false);
                }
                
                // Các logic còn lại giữ nguyên và sử dụng biến 'data'
                if (data?.variants?.length > 0) {
                    const initialVariant = data.variants[0];
                    setSelectedVariant(initialVariant);
                    setMainImage(data.thumbnail_url || initialVariant?.images?.[0] || '');
                    const firstAvailableOption = initialVariant.options.find(opt => opt.stock_quantity > 0);
                    setSelectedOption(firstAvailableOption || initialVariant.options?.[0] || null);
                }
            } catch (err) {
                setError(err.message);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        loadProductData();
    // *** SỬA LỖI 2: MẢNG PHỤ THUỘC CHỈ NÊN LÀ 'slug' ***
    }, [slug]);           

    const handleVariantSelect = (variantToSelect) => {
        setSelectedVariant(variantToSelect);
        // Khi đổi màu, luôn hiển thị ảnh đầu tiên của màu đó
        setMainImage(variantToSelect?.images?.[0] || '');
        
        // Reset và chọn lại option cho màu mới
        const firstAvailableOption = variantToSelect.options.find(opt => opt.stock_quantity > 0);
        setSelectedOption(firstAvailableOption || variantToSelect.options?.[0] || null);
        setQuantity(1);
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setQuantity(1);
    };

    const handleQuantityChange = (amount) => {
        const maxQuantity = selectedOption?.stock_quantity || 1;
        setQuantity(prev => {
            const newQuantity = prev + amount;
            if (newQuantity < 1) return 1;
            if (newQuantity > maxQuantity) return maxQuantity;
            return newQuantity;
        });
    };

    const handleViewAllReviews = async () => {
        if (!product?._id) return;
        setLoadingMoreReviews(true);
        try {
            // Gọi lại API nhưng không có limit để lấy tất cả
            const response = await fetch(`${API_URL}/ratings/product/${product._id}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews); // Cập nhật lại danh sách với tất cả reviews
            }
        } catch (error) {
            console.error("Lỗi khi tải tất cả đánh giá:", error);
        } finally {
            setLoadingMoreReviews(false);
        }
    };
    
    // Lấy giá bán và giá gốc (nếu có) từ option được chọn
    const displayPrice = useMemo(() => selectedOption?.price || 0, [selectedOption]);
    const listPrice = useMemo(() => selectedOption?.list_price || 0, [selectedOption]);

    // Lấy tên phân loại một cách linh động
    const primaryLabel = product?.classification_config?.[0]?.name || 'Phân loại 1';
    const secondaryLabel = product?.classification_config?.[1]?.name || 'Phân loại 2';

    if (loading) return <div className="status-message">Đang tải sản phẩm...</div>;
    if (error) return <div className="status-message error">Lỗi: {error}</div>;
    if (!product || !selectedVariant) return <div className="status-message">Không tìm thấy sản phẩm.</div>;
    
    // Kiểm tra xem tất cả các option của màu hiện tại có hết hàng không
    const isVariantOutOfStock = !selectedVariant.options.some(o => o.stock_quantity > 0);

    return (
        <div className="page-container">
            <div className="product-detail-container">
                <div className="product-gallery-section">
                    <div className="main-image-container">
                        <img src={mainImage} alt={`${product.name} - ${selectedVariant.name}`} className="main-image" />
                    </div>
                    <div className="thumbnail-list">
                        {(selectedVariant.images || []).map((img, index) => (
                            <div key={index} className={`thumbnail-item ${img === mainImage ? 'active' : ''}`} onClick={() => setMainImage(img)}>
                                <img src={img} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="product-info-section">
                    <div className="product-meta">
                        <span>Mã: {product.slug}</span>
                        <span>Thương hiệu: {product.brand?.name || 'Chưa xác định'}</span>
                        <span style={{ color: isVariantOutOfStock ? '#d9534f' : '#5cb85c' }}>
                            Tình trạng: {isVariantOutOfStock ? 'Hết hàng' : 'Còn hàng'}
                        </span>
                    </div>
                    <h1 className="product-name">{product.name}</h1>
                    
                    <div className="price-container">
                        <span className="current-price">{displayPrice.toLocaleString('vi-VN')}₫</span>
                        {listPrice > displayPrice && (
                             <span className="list-price">{listPrice.toLocaleString('vi-VN')}₫</span>
                        )}
                    </div>

                    <p className="selector-label">Chọn [{primaryLabel}]:</p>
                    <div className="variant-options">
                        {product.variants.map((variant) => (
                            <button key={variant.variant_id} className={`variant-option ${variant.variant_id === selectedVariant.variant_id ? 'active' : ''}`} onClick={() => handleVariantSelect(variant)}>
                                <img src={variant.images?.[0]} alt={variant.name} />
                                <div className="variant-info">
                                    <span>{variant.name}</span>
                                    <span>{(variant.options?.[0]?.price || 0).toLocaleString('vi-VN')}₫</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="selector-label">Chọn [{secondaryLabel}]:</p>
                    <div className="size-options">
                        {selectedVariant.options.map((option) => (
                            <button key={option.sku_code} className={`size-option ${option.value === selectedOption?.value ? 'active' : ''}`} disabled={option.stock_quantity === 0} onClick={() => handleOptionSelect(option)}>
                                {option.value}
                            </button>
                        ))}
                    </div>
                    
                    {selectedOption && (
                        <p className="stock-info">
                            {selectedOption.stock_quantity > 0 ? `Còn ${selectedOption.stock_quantity} sản phẩm` : 'Sản phẩm này đã hết hàng'}
                        </p>
                    )}

                    <p className="selector-label">Số lượng:</p>
                    <div className="quantity-selector">
                        <button type="button" className="quantity-btn" onClick={() => handleQuantityChange(-1)} disabled={!selectedOption || selectedOption.stock_quantity === 0}>-</button>
                        <input type="number" className="quantity-input" value={quantity} readOnly />
                        <button type="button" className="quantity-btn" onClick={() => handleQuantityChange(1)} disabled={!selectedOption || selectedOption.stock_quantity === 0}>+</button>
                    </div>

                    <div className="action-buttons">
                        <button className="action-btn buy-now-btn" disabled={!selectedOption || selectedOption.stock_quantity === 0}>Mua ngay</button>
                        <button className="action-btn add-to-cart-btn" disabled={!selectedOption || selectedOption.stock_quantity === 0}>Thêm vào giỏ hàng</button>
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
            <div id="reviews" className="reviews-wrapper">
                    <h2 className="content-title">Đánh giá về sản phẩm</h2>
                    {reviewsLoading ? (
                        <p>Đang tải đánh giá...</p>
                    ) : reviews.length > 0 ? (
                        <>
                            <div className="review-list">
                                {reviews.map(review => (
                                    <ReviewItem key={review._id} review={review} />
                                ))}
                            </div>

                            {totalReviewCount > reviews.length && (
                                <div className="view-all-container">
                                    <button 
                                        className="view-all-reviews-btn" 
                                        onClick={handleViewAllReviews}
                                        disabled={loadingMoreReviews}
                                    >
                                        {loadingMoreReviews ? 'Đang tải...' : `Xem tất cả ${totalReviewCount} đánh giá`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="no-reviews-message">Chưa có đánh giá nào cho sản phẩm này.</p>
                    )}
                </div>
            
        </div>
    );
};

export default ProductDetailPage;