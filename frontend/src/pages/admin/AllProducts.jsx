"use client"

import { useState } from "react"
import "./AllProducts.css"
import AddProducts from "./AddProducts"
const AllProducts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterValue, setFilterValue] = useState("Tất cả")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      specs: "256GB, Titanium Natural",
      category: "Điện thoại thông minh",
      price: "29.990.000",
      stock: 23,
      status: "Hoạt động",
      image: "/logo192.png",
      description:
        "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP chuyên nghiệp, màn hình Super Retina XDR 6.7 inch. Thiết kế Titanium cao cấp, chống nước IP68, bảo hành chính hãng 12 tháng.",
      variants: [
        { name: "256GB - Titanium Natural", price: "29.990.000", stock: 15, sku: "IP15PM-256-TN" },
        { name: "256GB - Titanium Blue", price: "29.990.000", stock: 8, sku: "IP15PM-256-TB" },
        { name: "512GB - Titanium Natural", price: "34.990.000", stock: 5, sku: "IP15PM-512-TN" },
      ],
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra 512GB",
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      specs: "512GB, Titanium Gray",
      category: "Điện thoại thông minh",
      price: "31.990.000",
      stock: 18,
      status: "Hoạt động",
      image: "/logo192.png",
      description:
        "Samsung Galaxy S24 Ultra với bút S Pen tích hợp, camera 200MP zoom 100x, màn hình Dynamic AMOLED 2X 6.8 inch. Chip Snapdragon 8 Gen 3, RAM 12GB, bảo hành chính hãng 12 tháng.",
      variants: [
        { name: "512GB - Titanium Gray", price: "31.990.000", stock: 10, sku: "S24U-512-TG" },
        { name: "512GB - Titanium Black", price: "31.990.000", stock: 8, sku: "S24U-512-TB" },
        { name: "1TB - Titanium Gray", price: "37.990.000", stock: 3, sku: "S24U-1TB-TG" },
      ],
    },
  ])
  const [currentPage, setCurrentPage] = useState("list")

  const stats = [
    { title: "Tổng sản phẩm", value: products.length.toString() },
    { title: "Tổng tồn kho", value: products.reduce((total, product) => total + product.stock, 0).toString() },
    { title: "Điện thoại", value: products.filter((p) => p.category === "Điện thoại thông minh").length.toString() },
    { title: "Sắp hết hàng", value: products.filter((p) => p.stock < 10).length.toString() },
  ]

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleDeleteProduct = (productId, e) => {
    e.stopPropagation()
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setProducts(products.filter((product) => product.id !== productId))
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterValue === "Tất cả" || product.category === filterValue
    return matchesSearch && matchesFilter
  })

  return (
    <div className="product-management">
      {currentPage === "list" && (
        <>

              <button className="add-product-btn" onClick={() => setCurrentPage("add")}>
                <span>+</span> Thêm sản phẩm mới
              </button>
            

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">{stat.title}</span>
                </div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="filter-select">
                <option>Tất cả</option>
                <option>Điện thoại thông minh</option>
                <option>Laptop</option>
                <option>Tablet</option>
                <option>Phụ kiện</option>
              </select>
              <button className="filter-btn">Bộ lọc</button>
            </div>
          </div>

          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Thông tin sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} onClick={() => handleProductClick(product)} style={{ cursor: "pointer" }}>
                    <td>
                      <img src={product.image || "/logo192.png"} alt={product.name} className="product-image" />
                    </td>
                    <td>
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-details">
                          {product.brand} • {product.model}
                        </div>
                        <div className="product-specs">{product.specs}</div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="price">{product.price} đ</td>
                    <td>{product.stock}</td>
                    <td>
                      <button className="action-btn delete-btn" onClick={(e) => handleDeleteProduct(product.id, e)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showProductDetail && selectedProduct && (
            <div className="modal-overlay" onClick={() => setShowProductDetail(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Chi tiết sản phẩm</h2>
                  <button className="close-btn" onClick={() => setShowProductDetail(false)}>
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="product-detail-section">
                    <h3>Thông tin cơ bản về sản phẩm</h3>
                    <div className="basic-info">
                      <img
                        src={selectedProduct.image || "/logo192.png"}
                        alt={selectedProduct.name}
                        className="detail-image"
                      />
                      <div className="basic-details">
                        <p>
                          <strong>Tên sản phẩm:</strong> {selectedProduct.name}
                        </p>
                        <p>
                          <strong>Thương hiệu:</strong> {selectedProduct.brand}
                        </p>
                        <p>
                          <strong>Model:</strong> {selectedProduct.model}
                        </p>
                        <p>
                          <strong>Ngành hàng:</strong> {selectedProduct.category}
                        </p>
                        <p>
                          <strong>Mô tả:</strong> {selectedProduct.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="product-detail-section">
                    <h3>Thông tin bán hàng</h3>
                    <h4>Phân loại sản phẩm:</h4>
                    <div className="variants-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Phân loại</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProduct.variants.map((variant, index) => (
                            <tr key={index}>
                              <td>{variant.name}</td>
                              <td>{variant.price} đ</td>
                              <td>{variant.stock}</td>
                              <td>{variant.sku}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {currentPage === "add" && <AddProducts onBack={() => setCurrentPage("list")} />}
    </div>
  )
}



export default AllProducts
