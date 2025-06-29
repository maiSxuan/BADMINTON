// SaleOffPage.js
import React, { useState, useMemo } from 'react';
import './Saleoff.css'; // Giả sử bạn dùng chung file CSS

// --- DỮ LIỆU & HẰNG SỐ ---

// Hằng số cho các bộ lọc
const discountLevels = ['20', '30', '40', '50', '60'];
const priceRanges = {
    'range1': { min: 0, max: 500000, label: 'Giá dưới 500.000đ' },
    'range2': { min: 500000, max: 1000000, label: '500.000đ - 1 triệu' },
    'range3': { min: 1000000, max: 2000000, label: '1 - 2 triệu' },
    'range4': { min: 2000000, max: 3000000, label: '2 - 3 triệu' },
    'range5': { min: 3000000, max: Infinity, label: 'Giá trên 3 triệu' }
};
const branches = ["SCD Premium", "SCD Quận 1", "SCD Quận 3", "SCD Quận 5", "SCD Quận 7", "SCD Quận 8"];

// Dữ liệu giả lập, bao gồm giá gốc và giá bán
const allMockProducts = [
    { id: 41, name: "Áo Cầu Lông Kumpoo KW 1108 Nam - Size: L", originalPrice: 450000, salePrice: 135000, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Quận 5"] },
    { id: 42, name: "Áo Cầu Lông Kumpoo KW 1108 Nam - Size: XL", originalPrice: 450000, salePrice: 135000, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Quận 5", "SCD Quận 7"] },
    { id: 44, name: "Băng Ống Tay Aolikes A-7146", originalPrice: 59000, salePrice: 23600, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Quận 1", "SCD Premium"] },
    { id: 45, name: "Vợt Cầu Lông Kamito Legend Limited 2023", originalPrice: 1800000, salePrice: 900000, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Quận 3", "SCD Quận 8"] },
    { id: 46, name: "Vợt Cầu Lông Kamito VTT Gowo", originalPrice: 1600000, salePrice: 800000, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Quận 7"] },
    { id: 47, name: "Giày Cầu Lông Yonex Strider - Trắng Hồng - Size: 39", originalPrice: 1090000, salePrice: 545000, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Premium", "SCD Quận 1"] },
    { id: 48, name: "Vợt Proace Stroke 318II", originalPrice: 1250000, salePrice: 1000000, imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp", inStockAt: ["SCD Quận 3"] },
];

function SaleOffPage() {
    const [filters, setFilters] = useState({
        discountLevels: [],
        priceRanges: [],
        branches: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Logic lọc sản phẩm
    const filteredProducts = useMemo(() => {
        let products = allMockProducts;

        // Lọc theo mức giảm giá
        if (filters.discountLevels.length > 0) {
            products = products.filter(p => {
                const percentOff = Math.floor(((p.originalPrice - p.salePrice) / p.originalPrice) * 100);
                return filters.discountLevels.some(level => percentOff >= parseInt(level));
            });
        }

        // Lọc theo khoảng giá (dựa trên giá đã giảm)
        if (filters.priceRanges.length > 0) {
            products = products.filter(p => {
                return filters.priceRanges.some(rangeKey => {
                    const range = priceRanges[rangeKey];
                    return p.salePrice >= range.min && p.salePrice < range.max;
                });
            });
        }
        
        // Lọc theo chi nhánh
        if (filters.branches.length > 0) {
            products = products.filter(p => p.inStockAt.some(branch => filters.branches.includes(branch)));
        }

        return products;
    }, [filters]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // Hàm xử lý chung cho checkbox
    const handleCheckboxChange = (filterName) => (e) => {
        const { value, checked } = e.target;
        const currentValues = filters[filterName];
        const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
        setFilters(prev => ({ ...prev, [filterName]: newValues }));
        setCurrentPage(1);
    };

    // Hàm render một thẻ sản phẩm
    const renderProductCard = (product) => {
        const discountPercent = Math.floor(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
        return React.createElement(
            'div', { key: product.id, className: 'product-card sale-card' },
            React.createElement('div', { className: 'sale-tag' }, `Giảm ${discountPercent}%`),
            React.createElement('img', { src: product.imageUrl, alt: product.name }),
            React.createElement('h4', { className: 'product-name' }, product.name),
            React.createElement(
                'div', { className: 'price-container' },
                React.createElement('p', { className: 'sale-price' }, `${product.salePrice.toLocaleString('vi-VN')} ₫`),
                React.createElement('p', { className: 'original-price' }, `${product.originalPrice.toLocaleString('vi-VN')} ₫`)
            ),
            React.createElement('p', { className: 'branch-info' }, product.inStockAt.join(', '))
        );
    };
    
    // Render toàn bộ component
    return React.createElement(
        'div', { className: 'container' },
        React.createElement(
            'main', { className: 'product-page-layout' },
            React.createElement(
                'aside', { className: 'sidebar' },
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'MỨC GIẢM GIÁ'),
                    React.createElement('ul', null, 
                        discountLevels.map(level => React.createElement('li', { key: level }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', value: level, onChange: handleCheckboxChange('discountLevels') }), ` ${level}%`
                        )))
                    )
                ),
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'CHỌN MỨC GIÁ'),
                    React.createElement('ul', null, 
                        Object.keys(priceRanges).map(key => React.createElement('li', { key }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', value: key, onChange: handleCheckboxChange('priceRanges') }), ` ${priceRanges[key].label}`
                        )))
                    )
                ),
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'CHI NHÁNH'),
                    React.createElement('ul', null, 
                        branches.map(branch => React.createElement('li', { key: branch }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', value: branch, onChange: handleCheckboxChange('branches') }), ` ${branch}`
                        )))
                    )
                )
            ),
            React.createElement(
                'section', { className: 'product-content' },
                React.createElement('h1', { className: 'page-title' }, 'SẢN PHẨM THANH LÝ'),
                React.createElement(
                    'div', { className: 'product-grid' },
                    paginatedProducts.length > 0
                        ? paginatedProducts.map(product => renderProductCard(product))
                        : React.createElement('p', { className: 'no-products' }, 'Không tìm thấy sản phẩm phù hợp.')
                ),
                React.createElement(
                    'nav', { className: 'pagination' },
                    totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber =>
                        React.createElement('button', { key: pageNumber, className: currentPage === pageNumber ? 'active' : '', onClick: () => setCurrentPage(pageNumber) }, pageNumber)
                    )
                )
            )
        )
    );
}

export default SaleOffPage;