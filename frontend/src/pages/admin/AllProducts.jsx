// src/pages/admin/products/AllProducts.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./AllProducts.css";
import { getProductsOnQuery, getAllCategories, deleteProduct, togglePublishProduct, getAllBrands } from "../../services";
import { usePopup } from "../../components/common/popupContext";

const AllProducts = () => {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho bộ lọc
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]); // 
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Tất cả danh mục");
    const [filterBrand, setFilterBrand] = useState("Tất cả thương hiệu");

    // State cho modal chi tiết
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductDetail, setShowProductDetail] = useState(false);

    const { showPopup } = usePopup();
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [productsResult, categoriesData, brandsData] = await Promise.all([
                    getProductsOnQuery({ limit: 1000, view: 'admin' }),
                    getAllCategories(),
                    getAllBrands() // Gọi thêm API lấy brands
                ]);
                setAllProducts(productsResult.data);
                setCategories(categoriesData);
                setBrands(brandsData); // Lưu danh sách brands vào state
            } catch (err) {
                setError(err.message || 'Không thể tải dữ liệu từ server.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (filterCategory === "Tất cả danh mục" || p.prod === filterCategory) &&
        (filterBrand === "Tất cả thương hiệu" || p.brand === filterBrand) 
    ), [allProducts, searchTerm, filterCategory, filterBrand]);

    const stats = useMemo(() => [
        { title: "Tổng sản phẩm", value: allProducts.length },
        { title: "Tổng tồn kho", value: allProducts.reduce((sum, p) => sum + (p.stock || 0), 0) },
        { title: "Danh mục", value: categories.length },
        { title: "Thương hiệu", value: brands.length },
        { title: "Sắp hết hàng", value: allProducts.filter(p => p.stock > 0 && p.stock < 10).length } 
    ], [allProducts, categories, brands]);

    // Các hàm handler (không thay đổi logic chính)
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowProductDetail(true);
    };
    const handleAdd = () => navigate("/admin/add-product");
    const handleEdit = (slug, e) => {
        e.stopPropagation();
        navigate(`/admin/edit-product/${slug}`);
    };
    const handleDeleteProduct = async (slug, e) => {
        e.stopPropagation();
        // if (window.confirm("Hành động này sẽ XÓA VĨNH VIỄN sản phẩm. Bạn chắc chắn?")) {
        showPopup(
            'Xác nhận xóa',
            'Hành động này sẽ XÓA VĨNH VIỄN sản phẩm. Bạn chắc chắn?',
            'Xóa',
            async () => {
                try {
                    await deleteProduct(slug);
                    setAllProducts(prev => prev.filter(p => p.slug !== slug));
                    // alert('Xóa thành công.')
                    showPopup(
                        'Thông báo',
                        'Xóa thành công',
                        null,
                        null,
                        4,
                        3
                    )
                } catch (err) {
                    // alert(err.message);
                    showPopup(
                        'Lỗi',
                        err.message || 'Xóa sản phẩm thất bại',
                        null,
                        null,
                        4,
                        3
                    )
                }
            },
            4
        )
        // }
    };
    const handleTogglePublish = async (product, e) => {
        e.stopPropagation();
        try {
            await togglePublishProduct(product.slug);
            setAllProducts(prev =>
                prev.map(p => p.id === product.id ? { ...p, is_published: !p.is_published } : p)
            );
        } catch (err) {
            // alert(err.message);
            showPopup(
                'Lỗi',
                err.message || 'Cập nhật trạng thái thất bại',
                null,
                null,
                4,
                3
            )
        }
    };

    return (
        <div className="product-management">
            <button className="add-product-btn" onClick={handleAdd}>
                <span>+</span> Thêm sản phẩm mới
            </button>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-header"><span className="stat-title">{stat.title}</span></div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="controls">
                <div className="search-container">
                    <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                </div>
                <div className="filter-controls">
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                        <option>Tất cả danh mục</option>
                        {categories.map(cat => (<option key={cat._id} value={cat.name}>{cat.name}</option>))}
                    </select>
                    <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="filter-select">
                        <option>Tất cả thương hiệu</option>
                        {brands.map(brand => (<option key={brand._id} value={brand.name}>{brand.name}</option>))}
                    </select>
                </div>
            </div>

            <div className="products-table-container">
                {isLoading ? (<p style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</p>) 
                : error ? (<p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Lỗi: {error}</p>) 
                : (
                    <table className="products-table">
                        <thead>
                            <tr><th>Hình ảnh</th><th>Thông tin sản phẩm</th><th>Thương hiệu</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} onClick={() => handleProductClick(product)} style={{ cursor: "pointer" }}>
                                    <td><img src={product.imageUrl || "/logo192.png"} alt={product.name} className="product-image" /></td>
                                    <td>
                                        <div className="product-info">
                                            <div className="product-name">{product.name}</div>
                                            <div className="product-details">{product.brand} • {product.prod}</div>
                                        </div>
                                    </td>
                                    <td>{product.brand}</td> 
                                    <td className="price">{product.price.toLocaleString('vi-VN')} đ</td>
                                    <td>
                                        {product.stock}
                                        {product.stock > 0 && product.stock < 10 && (<span className="low-stock-warning">Sắp hết</span>)}
                                    </td>
                                    <td>
                                        <span className={`status-cell ${product.is_published ? 'published' : 'draft'}`}>
                                            {product.is_published ? 'Đang bán' : 'Bị ẩn'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons-cell">
                                            <button className="action-btn edit-btn" onClick={(e) => handleEdit(product.slug, e)}>Sửa</button>
                                            <button className={`action-btn ${product.is_published ? 'unpublish-btn' : 'publish-btn'}`} onClick={(e) => handleTogglePublish(product, e)}>{product.is_published ? 'Ẩn' : 'Bán'}</button>
                                            <button className="action-btn delete-btn" onClick={(e) => handleDeleteProduct(product.slug, e)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showProductDetail && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowProductDetail(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết sản phẩm</h2>
                            <button className="close-btn" onClick={() => setShowProductDetail(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="product-detail-section">
                                <h3>Thông tin cơ bản</h3>
                                <div className="basic-info">
                                    <img src={selectedProduct.imageUrl || "/logo192.png"} alt={selectedProduct.name} className="detail-image" />
                                    <div className="basic-details">
                                        <p><strong>Tên sản phẩm:</strong> {selectedProduct.name}</p>
                                        <p><strong>Thương hiệu:</strong> {selectedProduct.brand}</p>
                                        <p><strong>Ngành hàng:</strong> {selectedProduct.prod}</p>
                                        <p><strong>Mô tả:</strong> <span dangerouslySetInnerHTML={{ __html: selectedProduct.description?.replace(/\n/g, '<br />') || 'Chưa có mô tả.' }} /></p>
                                    </div>
                                </div>
                            </div>
                            {selectedProduct.variants?.length > 0 && (
                                <div className="product-detail-section">
                                    <h3>Thông tin bán hàng</h3>
                                    <div className="variants-table">
                                        <table>
                                            <thead><tr><th>Phân loại</th><th>Giá bán</th><th>Tồn kho</th><th>SKU</th></tr></thead>
                                            <tbody>
                                                {selectedProduct.variants.map((variant) => 
                                                    variant.options.map((option, index) => (
                                                        <tr key={option._id || `${variant.name}-${index}`}>
                                                            <td>{variant.name} - {option.value}</td>
                                                            <td>{option.price.toLocaleString('vi-VN')} đ</td>
                                                            <td>{option.stock_quantity}</td>
                                                            <td>{option.sku_code}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AllProducts;