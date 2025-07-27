"use client"

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./AllProducts.css";

const AllProducts = () => {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Tất cả");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductDetail, setShowProductDetail] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products?limit=1000&sort=newest&view=admin'),
                    fetch('/api/categories')
                ]);
                if (!productsRes.ok || !categoriesRes.ok) throw new Error('Không thể tải dữ liệu từ server.');
                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();
                setAllProducts(productsData.data);
                setCategories(categoriesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (filterCategory === "Tất cả" || p.prod === filterCategory)
    ), [allProducts, searchTerm, filterCategory]);

    const stats = useMemo(() => [
        { title: "Tổng sản phẩm", value: allProducts.length },
        { title: "Tổng tồn kho", value: allProducts.reduce((sum, p) => sum + (p.stock || 0), 0) },
        { title: "Danh mục", value: categories.length },
        { title: "Sắp hết hàng", value: allProducts.filter(p => p.stock > 0 && p.stock < 10).length },
    ], [allProducts, categories]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowProductDetail(true);
    };

    const handleAdd = () => navigate("/admin/add-product");

    const handleDeleteProduct = async (productSlug, e) => {
        e.stopPropagation();
        if (window.confirm("Hành động này sẽ XÓA VĨNH VIỄN sản phẩm. Bạn chắc chắn?")) {
            try {
                const response = await fetch(`/api/products/${productSlug}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Xóa thất bại.');
                }
                setAllProducts(prev => prev.filter(p => p.slug !== productSlug));
                alert('Xóa sản phẩm vĩnh viễn thành công.');
            } catch (err) {
                alert(`Lỗi: ${err.message}`);
            }
        }
    };

    const handleTogglePublish = async (product, e) => {
        e.stopPropagation();
        const action = product.is_published ? "Ẩn" : "Đăng bán";
        try {
            const response = await fetch(`/api/products/${product.slug}/toggle-publish`, { method: 'PATCH' });
            if (!response.ok) throw new Error(`Không thể ${action} sản phẩm.`);
            setAllProducts(prev => 
                prev.map(p => 
                    p.id === product.id ? { ...p, is_published: !p.is_published } : p
                )
            );
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
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
                        <option>Tất cả</option>
                        {categories.map(cat => (<option key={cat._id} value={cat.name}>{cat.name}</option>))}
                    </select>
                    <button className="filter-btn">Bộ lọc</button>
                </div>
            </div>

            <div className="products-table-container">
                {isLoading ? (<p style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</p>) 
                : error ? (<p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Lỗi: {error}</p>) 
                : (
                    <table className="products-table">
                        <thead>
                            <tr><th>Hình ảnh</th><th>Thông tin sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
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
                                    <td>{product.prod}</td>
                                    <td className="price">{product.price.toLocaleString('vi-VN')} đ</td>
                                    <td>
                                        {product.stock}
                                        {product.stock > 0 && product.stock < 10 && (<span className="low-stock-warning">Sắp hết</span>)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.is_published ? 'published' : 'draft'}`}>
                                            {product.is_published ? 'Đang bán' : 'Bị ẩn'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons-cell">
                                            <button className={`action-btn ${product.is_published ? 'unpublish-btn' : 'publish-btn'}`} onClick={(e) => handleTogglePublish(product, e)}>
                                                {product.is_published ? 'Ẩn' : 'Bán'}
                                            </button>
                                            <button className="action-btn delete-btn" onClick={(e) => handleDeleteProduct(product.slug, e)}>
                                                Xóa
                                            </button>
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
                                        <p><strong>Mô tả:</strong> {selectedProduct.description || 'Chưa có mô tả.'}</p>
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
                                                        <tr key={option._id || index}>
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
                        <div className="modal-footer">
                            <button className="update-product-btn" onClick={() => navigate(`/admin/edit-product/${selectedProduct.slug}`)}>
                                Chỉnh sửa sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AllProducts;