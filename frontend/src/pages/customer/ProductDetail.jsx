import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './ProductDetail.css'; 
import { addItemToCart, getProductBySlug,getAllCategories,getRatingsByProduct } from '../../services';
import { usePopup } from '../../components/common/popupContext';
import Breadcrumb from '../../components/common/breadcrumb';
import { CheckCircle2, Gift, ShieldCheck } from 'lucide-react';

const StarRating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="star-rating">
            {[...Array(totalStars)].map((_, index) => {
                const starClass = index < rating ? 'filled' : 'empty';
                return <span key={index} className={`star ${starClass}`}>★</span>;
            })}
        </div>
    );
};
const ProductDetailPage = () => {
    const navigate = useNavigate();
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
    const [isAdding, setIsAdding] = useState(false);

    const { showPopup } = usePopup();

    const [categories,setCategories] = useState([]);
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
            } catch (err) {
                console.error("Không thể tải danh mục sản phẩm", err);
            }
        };
        loadCategories(); // Gọi đúng hàm
    }, []);
    const handleCategoryClick = (categorySlug) => {
        navigate(`/products?categories=${categorySlug}`);
    };
    useEffect(() => {
        const loadProductData = async () => {
            if (!slug) {
                setError("Không tìm thấy slug sản phẩm.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getProductBySlug(slug);
                setProduct(data);

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
    }, [slug]);

    useEffect(() => {
        const loadReviews = async () => {
            if (!product?._id) return;

            try {
                setReviewsLoading(true);
                const data = await getRatingsByProduct(product._id);
                setReviews(data.reviews || []);
            } catch (err) {
                console.error("Lỗi khi tải đánh giá:", err);
            } finally {
                setReviewsLoading(false);
            }
        };

        loadReviews();
    }, [product?._id]);

    const handleVariantSelect = (variantToSelect) => {
        setSelectedVariant(variantToSelect);
        setMainImage(variantToSelect?.images?.[0] || '');

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

    const handleBuyNow = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            showPopup(
                'Thông báo',
                'Bạn cần đăng nhập để có thể mua sản phẩm',
                'Đăng nhập',
                () => {
                    navigate('/login');
                },
                4
            );
            return;
        }

        if (!product || !selectedVariant || !selectedOption) {
            showPopup(
                'Thông báo',
                'Vui lòng chọn đầy đủ thông tin sản phẩm',
                null,
                null,
                4,
                2
            )
            return;
        }

        if (selectedOption.stock_quantity < quantity) {
            showPopup(
                'Thông báo',
                'Số lượng vượt quá tồn kho. Vui lòng chọn lại số lượng sản phẩm',
                null,
                null,
                4,
                2
            )
            return;
        }

        const getSalePrice = () => {
            if (product.sale && product.sale_price)
                return product.sale_price
            return selectedOption.price
        }

        const selectedItem = {
            _id: product._id, 
            name: product.name || 'Không rõ tên',
            productId: product._id,
            variantId: selectedVariant._id,
            optionId: selectedOption._id,
            quantity,
            // price: selectedOption.price,
            price: getSalePrice(),
            color: selectedVariant.name || 'Không xác định',
            size: selectedOption.value || 'Không xác định',
            image: selectedVariant.image || product.thumbnail_url || "/placeholder.svg",
            categories_id: product.categories_id
        };

        navigate("/purchase", {
            state: { selectedItems: [selectedItem] }
        });
    };

    const handleAddToCart = async () => {
        if (!product || !selectedVariant || !selectedOption) {
            showPopup(
                'Thông báo',
                'Vui lòng chọn đầy đủ thông tin sản phẩm',
                null,
                null,
                4, 
                2
            )
            return;
        }

        if (selectedOption.stock_quantity < quantity) {
            showPopup(
                'Thông báo',
                'Số lượng vượt quá tồn kho. Vui lòng chọn lại số lượng sản phẩm',
                null,
                null,
                4, 
                2
            )
            return;
        }

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            showPopup(
                'Thông báo',
                'Bạn cần đăng nhập để có thể thêm sản phẩm vào giỏ hàng',
                'Đăng nhập',
                () => {
                    navigate('/login');
                },
                4
            );
            return;
        }

        setIsAdding(true);

        try {
            await addItemToCart({
                productId: product._id,
                variantId: selectedVariant._id,
                optionId: selectedOption._id,
                quantity,
            });
            window.dispatchEvent(new Event("cartUpdated"));
            showPopup(
                'Thông báo',
                'Thêm sản phẩm vào giỏ hàng thành công',
                null,
                null,
                4, 
                2
            )
            setQuantity(1);
        } catch (err) {
            showPopup(
                'Lỗi',
                err.message || 'Thêm sản phẩm vào giỏ hàng thất bại',
                null,
                null,
                4, 
                2
            )
        } finally {
            setIsAdding(false)
        }
    }

    const displayPrice = useMemo(() => {
        const basePrice = (selectedOption?.price ?? product?.price) ?? 0; 
        const salePrice = product?.sale_price ?? 0;

        if (product?.sale && salePrice > 0 && salePrice < basePrice) {
            return salePrice;
        }
        return basePrice;
    }, [product, selectedOption]);

    const listPrice = useMemo(() => {
        const basePrice = (selectedOption?.price ?? product?.price) ?? 0;
        const salePrice = product?.sale_price ?? 0;

        if (product?.sale && salePrice > 0 && salePrice < basePrice) {
            return basePrice;
        }
        return 0;
    }, [product, selectedOption]);

    // Lấy tên phân loại một cách linh động
    const primaryLabel = product?.classification_config?.[0]?.name || 'Phân loại 1';
    const secondaryLabel = product?.classification_config?.[1]?.name || 'Phân loại 2';

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

    // if (loading) return <div className="status-message">Đang tải sản phẩm...</div>;
    if (loading) return <LoadingSpinner />;

    // if (error) return <div className="status-message error">Lỗi: {error}</div>;
    if (error) return <ErrorMessage message={error} />;

    if (!product || !selectedVariant) return <div className="status-message">Không tìm thấy sản phẩm.</div>;

    // Kiểm tra xem tất cả các option của màu hiện tại có hết hàng không
    const isVariantOutOfStock = !selectedVariant.options.some(o => o.stock_quantity > 0);
    const breadcrumbItems = [
        { label: 'Trang chủ', path: '/' },
        { label: 'Sản phẩm', path: '/products' },
        { label: product.name || 'Chi tiết sản phẩm' } 
    ];
    const isRacket = product.category_ids?.some(
    category => category.slug?.trim().toLowerCase() === "vot-cau-long"
    );
    return (
        <Fragment>
        <div className="breadcrumb-wrapper">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="product-detail-layout">
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
                        {listPrice > 0 && listPrice > displayPrice ? (
                            <>
                                <span className="current-price">{displayPrice.toLocaleString('vi-VN')} ₫</span>
                                <span className="original-price" style={{ textDecoration: 'line-through', color: '#888', marginLeft: '8px' }}>
                                    {listPrice.toLocaleString('vi-VN')} ₫
                                </span>
                            </>
                        ) : (
                            <span className="current-price">{displayPrice.toLocaleString('vi-VN')} ₫</span>
                        )}
                    </div>

                    <p className="selector-label">Chọn [{primaryLabel}]:</p>
                    <div className="variant-options">
                        {product.variants.map((variant) => (
                            <button key={variant.variant_id} className={`variant-option ${variant._id === selectedVariant._id ? 'active' : ''}`} onClick={() => handleVariantSelect(variant)}>
                                <img src={variant.images?.[0]} alt={variant.name} />
                                <div className="variant-info">
                                    <span>{variant.name}</span>
                                    <span>
                                        {product.sale && product.sale_price > 0
                                            ? product.sale_price.toLocaleString('vi-VN') + '₫'
                                            : (variant.options?.[0]?.price || 0).toLocaleString('vi-VN') + '₫'
                                        }
                                    </span>
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
                    <div className="product-offers-box">
                    <div className="offer-group">
                        <h5 className="offer-title">
                            <Gift size={16} className="offer-icon-main" /> ƯU ĐÃI
                        </h5>
                        <ul>
                            {isRacket && (
                            <li
                                onClick={() =>
                                navigate("/products/quan-can-vai-taro-tr025-og02-chinh-hang")
                                }
                                style={{ cursor: "pointer" }}
                            >
                                <CheckCircle2 size={14} className="offer-icon" />
                                <span>
                                Tặng Quấn cán vợt cầu lông <strong>Taro</strong>
                                </span>
                            </li>
                            )}
                            <li><CheckCircle2 size={14} className="offer-icon" /> <span>Sản phẩm cam kết chính hãng</span></li>
                            <li><ShieldCheck size={14} className="offer-icon" /> <span>Bảo hành chính hãng theo nhà sản xuất</span></li>
                        </ul>
                    </div>
                    
                    <div className="offer-group premium-offer">
                        <h5 className="offer-title">
                            Ưu đãi thêm khi mua sản phẩm tại SCD Premium
                        </h5>
                        <ul>
                            {isRacket && (
                                <Fragment>
                                    <li><CheckCircle2 size={14} className="offer-icon" /> <span>Sơn logo mặt vợt miễn phí</span></li>
                                    <li><CheckCircle2 size={14} className="offer-icon" /> <span>Bảo hành lưới đan trong 72 giờ</span></li>
                                    <li><CheckCircle2 size={14} className="offer-icon" /> <span>Thay gen vợt miễn phí trọn đời</span></li>
                                </Fragment>
                            )}
                            <li><CheckCircle2 size={14} className="offer-icon" /> <span>Tích luỹ điểm thành viên Premium</span></li>
                            <li><CheckCircle2 size={14} className="offer-icon" /> <span>Voucher giảm giá cho lần mua hàng tiếp theo</span></li>
                        </ul>
                    </div>
                </div>
                    <p className="selector-label">Số lượng:</p>
                    <div className="quantity-selector">
                        <button type="button" className="quantity-btn" onClick={() => handleQuantityChange(-1)} disabled={!selectedOption || selectedOption.stock_quantity === 0}>-</button>
                        <input type="number" className="quantity-input" value={quantity} readOnly />
                        <button type="button" className="quantity-btn" onClick={() => handleQuantityChange(1)} disabled={!selectedOption || selectedOption.stock_quantity === 0}>+</button>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="detail-action-btn buy-now-btn"
                            disabled={!selectedOption || selectedOption.stock_quantity === 0}
                            onClick={handleBuyNow}
                        >
                            Mua ngay
                        </button>
                        <button
                            className="detail-action-btn add-to-cart-btn"
                            disabled={!selectedOption || selectedOption.stock_quantity === 0}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                        </button>
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
            <div className="product-reviews-section">
                <h2 className="reviews-title">Đánh giá từ khách hàng</h2>
                {reviewsLoading ? (
                    // <p>Đang tải đánh giá...</p>
                    <LoadingSpinner />
                ) : reviews.length > 0 ? (
                    <div className="review-list">
                        {reviews.map((review) => (
                            <div key={review._id} className="review-item">
                                <div className="review-header">
                                    <span className="review-user">{review.user?.name || 'Người dùng'}</span>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <p className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
            </div>
        </div>
        <aside className="product-sidebar">
                    <h3 className="sidebar-title">Danh mục sản phẩm</h3>
                    <ul className="category-list">
                        {categories.map(category => (
                            <li key={category._id} className="category-item" onClick={() => handleCategoryClick(category.slug)}>
                                <span>{category.name}</span>
                                <span>+</span>
                            </li>
                        ))}
                    </ul>
                </aside>
        </div>
        </Fragment>
    );
};

export default ProductDetailPage;