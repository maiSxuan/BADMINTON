// ProductPage.js
import React, { useState, useMemo } from 'react';
import './ProductPage.css'; // Import file CSS

// Dữ liệu giả lập - Trong dự án thật, bạn sẽ lấy từ API
const allMockProducts = [
    { id: 1, name: "Vợt Cầu Lông Victor Thruster Ryuga Metallic", prod: "Vợt cầu lông", price: 3980000, brand: "Victor", imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp" },
    { id: 2, name: "Vợt Cầu Lông Lining Halbertec 5000", prod: "Vợt cầu lông", price: 1380000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-lining-halbertec-5000-chinh-hang_1685418193.webp" },
    // Thêm dữ liệu để test bộ lọc sản phẩm
    { id: 3, name: "Giày Cầu Lông Yonex Power Cushion 65Z3", prod: "Giày cầu lông", price: 2150000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/giay-cau-long-yonex-shb-65z3-men-trang-chinh-hang_1672300735.webp" },
    { id: 4, name: "Balo Cầu Lông Yonex BP001U", prod: "Balo cầu lông", price: 750000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-yonex-bp001u-den-chinh-hang_1699943472.webp" },

];

const priceRanges = {
    'range1': { min: 0, max: 500000 },
    'range2': { min: 500000, max: 1000000 },
    'range3': { min: 1000000, max: 2000000 },
    'range4': { min: 2000000, max: 3000000 },
    'range5': { min: 3000000, max: Infinity }
};

const brands = ["Yonex", "Lining", "Victor", "Mizuno", "Adidas", "Proace"];
const productTypes = ["Vợt cầu lông", "Balo cầu lông", "Giày cầu lông", "Quần áo cầu lông", "Phụ kiện"]; 

function ProductPage() {
    // SỬA LỖI 1: Thêm 'prod: []' vào state ban đầu
    const [filters, setFilters] = useState({ price: null, brands: [], prod: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    const filteredProducts = useMemo(() => {
        let products = allMockProducts;

        // Lọc theo giá
        if (filters.price && priceRanges[filters.price]) {
            const { min, max } = priceRanges[filters.price];
            products = products.filter(p => p.price >= min && p.price < max);
        }

        // Lọc theo thương hiệu
        if (filters.brands.length > 0) {
            products = products.filter(p => filters.brands.includes(p.brand));
        }

        // SỬA LỖI 2: Lọc theo loại sản phẩm
        if (filters.prod.length > 0) {
            // Sửa 'p.racket' thành 'p.prod' để khớp với dữ liệu mock
            products = products.filter(p => filters.prod.includes(p.prod));
        }

        return products;
    }, [filters]);

    // TÍNH TOÁN PHÂN TRANG
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // CÁC HÀM XỬ LÝ SỰ KIỆN
    const handlePriceChange = (e) => {
        setFilters(prev => ({ ...prev, price: e.target.value }));
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    const handleBrandChange = (e) => {
        const { value, checked } = e.target;
        const currentBrands = filters.brands;
        const newBrands = checked
            ? [...currentBrands, value]
            : currentBrands.filter(brand => brand !== value);
        
        setFilters(prev => ({ ...prev, brands: newBrands }));
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    // SỬA LỖI 3: Sửa lại hoàn toàn hàm handleProdChange
    const handleProdChange = (e) => {
        const { value, checked } = e.target;
        // Lấy đúng state của 'prod'
        const currentProds = filters.prod; 
        const newProds = checked
            ? [...currentProds, value] // Thêm sản phẩm được chọn vào mảng
            // Lọc ra sản phẩm bị bỏ chọn
            : currentProds.filter(prod => prod !== value); 
        
        // Cập nhật đúng state của 'prod'
        setFilters(prev => ({ ...prev, prod: newProds }));
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };
    
    return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
            'main',
            { className: 'product-page-layout' },
            // --- SIDEBAR ---
            React.createElement(
                'aside',
                { className: 'sidebar' },
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'CHỌN MỨC GIÁ'),
                    React.createElement('ul', null, 
                        Object.keys(priceRanges).map((key, index) => React.createElement('li', { key }, React.createElement('label', null,
                            React.createElement('input', { type: 'radio', name: 'price', value: key, onChange: handlePriceChange }),
                            index === 0 ? ` Dưới ${priceRanges[key].max.toLocaleString()}đ` :
                            index === 4 ? ` Trên ${priceRanges[key].min.toLocaleString()}đ` :
                            ` ${priceRanges[key].min.toLocaleString()}đ - ${priceRanges[key].max.toLocaleString()}đ`
                        )))
                    )
                ),
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'THƯƠNG HIỆU'),
                    React.createElement('ul', null, 
                        brands.map(brand => React.createElement('li', { key: brand }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', name: 'brand', value: brand, onChange: handleBrandChange }),
                            ` ${brand}`
                        )))
                    )
                ),

                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'CHỌN SẢN PHẨM'),
                    React.createElement('ul', null, 
                        // SỬA LỖI 4: Lặp qua mảng 'productTypes' thay vì 'brands'
                        productTypes.map(prod => React.createElement('li', { key: prod }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', name: 'prod', value: prod, onChange: handleProdChange }),
                            ` ${prod}`
                        )))
                    )
                )
            ),
            // --- PRODUCT CONTENT ---
            React.createElement(
                'section',
                { className: 'product-content' },
                React.createElement('h1', { className: 'page-title' }, 'SẢN PHẨM TIÊU BIỂU'),
                // -- Product Grid --
                React.createElement(
                    'div',
                    { className: 'product-grid' },
                    paginatedProducts.length > 0
                        ? paginatedProducts.map(product => React.createElement(
                            'div',
                            { key: product.id, className: 'product-card' },
                            React.createElement('img', { src: product.imageUrl, alt: product.name }),
                            React.createElement('h4', null, product.name),
                            React.createElement('p', { className: 'price' }, `${product.price.toLocaleString('vi-VN')} ₫`)
                        ))
                        : React.createElement('p', { className: 'no-products' }, 'Không tìm thấy sản phẩm phù hợp.')
                ),
                // -- Pagination --
                React.createElement(
                    'nav',
                    { className: 'pagination' },
                    totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber =>
                        React.createElement(
                            'button',
                            {
                                key: pageNumber,
                                className: currentPage === pageNumber ? 'active' : '',
                                onClick: () => setCurrentPage(pageNumber)
                            },
                            pageNumber
                        )
                    )
                )
            )
        )
    );
}

export default ProductPage;