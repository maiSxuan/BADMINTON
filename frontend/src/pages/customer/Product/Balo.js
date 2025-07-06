// BackpackPage.js
import React, { useState, useMemo } from 'react';
import './Outline.css'; // Dùng chung file CSS với các trang khác

// --- DỮ LIỆU ---

// Hằng số cho các bộ lọc
const brands = ["Yonex", "Lining", "Victor", "Kawasaki"];
const branches = ["SCD Premium", "SCD Quận 1", "SCD Quận 3", "SCD Quận 5", "SCD Quận 7", "SCD Quận 8"];

// Mức giá phù hợp cho balo
const priceRanges = {
    'range1': { min: 0, max: 500000 },
    'range2': { min: 500000, max: 1000000 },
    'range3': { min: 1000000, max: 1500000 },
    'range4': { min: 1500000, max: Infinity }
};

// Dữ liệu giả lập cho balo
const allMockProducts = [
    { id: 31, name: "Balo Cầu Lông Yonex BP001U Đen", price: 750000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-yonex-bp001u-den-chinh-hang_1699943472.webp", inStockAt: ["SCD Quận 1", "SCD Quận 5", "SCD Premium"] },
    { id: 32, name: "Balo Cầu Lông Lining ABSJ433-1", price: 890000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-lining-absj433-1-chinh-hang_1693452285.webp", inStockAt: ["SCD Quận 3", "SCD Quận 7"] },
    { id: 33, name: "Balo Cầu Lông Victor BR3026C", price: 1250000, brand: "Victor", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-victor-br3026c-chinh-hang_1697275062.webp", inStockAt: ["SCD Premium", "SCD Quận 8"] },
    { id: 34, name: "Balo Cầu Lông Yonex BP102MS", price: 1100000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-yonex-bp102ms-trang-xanh-chinh-hang_1699945281.webp", inStockAt: ["SCD Quận 1", "SCD Quận 3"] },
    { id: 35, name: "Balo Cầu Lông Kawasaki KBB-8656", price: 480000, brand: "Kawasaki", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-kawasaki-kbb-8656-xanh-chinh-hang_1625024446.webp", inStockAt: [] }, // Hết hàng
    { id: 36, name: "Balo Cầu Lông Lining ABSN282-4", price: 650000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-lining-absn282-4-xanh-chinh-hang_1625208643.webp", inStockAt: ["SCD Quận 5", "SCD Quận 7", "SCD Quận 8"] }
];


function BackpackPage() {
    // State cho các bộ lọc
    const [filters, setFilters] = useState({ 
        price: null, 
        brands: [],
        branches: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    // Logic lọc sản phẩm
    const filteredProducts = useMemo(() => {
        let products = allMockProducts;

        // Lọc theo giá
        if (filters.price && priceRanges[filters.price]) {
            const { min, max } = priceRanges[filters.price];
            products = products.filter(p => p.price >= min && p.price < max);
        }

        // Lọc theo hãng
        if (filters.brands.length > 0) {
            products = products.filter(p => filters.brands.includes(p.brand));
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

    // Hàm xử lý sự kiện (dùng factory function cho gọn)
    const handleFilterChange = (filterName, isCheckbox = false) => (e) => {
        const { value, checked } = e.target;
        
        if (isCheckbox) {
            const currentValues = filters[filterName];
            const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
            setFilters(prev => ({ ...prev, [filterName]: newValues }));
        } else {
            setFilters(prev => ({ ...prev, [filterName]: value }));
        }
        
        setCurrentPage(1);
    };

    const handlePriceChange = handleFilterChange('price');
    const handleBrandChange = handleFilterChange('brands', true);
    const handleBranchChange = handleFilterChange('branches', true);
    
    // Render giao diện
    return React.createElement(
        'div', { className: 'container' },
        React.createElement(
            'main', { className: 'product-page-layout' },
            // --- SIDEBAR ---
            React.createElement(
                'aside', { className: 'sidebar' },
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'MỨC GIÁ'),
                    React.createElement('ul', null, 
                        Object.keys(priceRanges).map((key, index) => React.createElement('li', { key }, React.createElement('label', null,
                            React.createElement('input', { type: 'radio', name: 'price', value: key, onChange: handlePriceChange }),
                             index === 0 ? ` Dưới ${priceRanges[key].max.toLocaleString()}đ` :
                             index === 3 ? ` Trên ${priceRanges[key].min.toLocaleString()}đ` :
                             ` ${priceRanges[key].min.toLocaleString()}đ - ${priceRanges[key].max.toLocaleString()}đ`
                        )))
                    )
                ),
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'HÃNG'),
                    React.createElement('ul', null, 
                        brands.map(brand => React.createElement('li', { key: brand }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', name: 'brand', value: brand, onChange: handleBrandChange }),
                            ` ${brand}`
                        )))
                    )
                ),
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'CHI NHÁNH CÓ HÀNG'),
                    React.createElement('ul', null, 
                        branches.map(branch => React.createElement('li', { key: branch }, React.createElement('label', null,
                            React.createElement('input', { type: 'checkbox', name: 'branch', value: branch, onChange: handleBranchChange }),
                            ` ${branch}`
                        )))
                    )
                )
            ),
            // --- PRODUCT CONTENT ---
            React.createElement(
                'section', { className: 'product-content' },
                React.createElement('h1', { className: 'page-title' }, 'BALO CẦU LÔNG'),
                React.createElement(
                    'div', { className: 'product-grid' },
                    paginatedProducts.length > 0
                        ? paginatedProducts.map(product => React.createElement(
                            'div', { key: product.id, className: 'product-card' },
                            React.createElement('img', { src: product.imageUrl, alt: product.name }),
                            React.createElement('h4', null, product.name),
                            React.createElement('p', { className: 'price' }, `${product.price.toLocaleString('vi-VN')} ₫`)
                        ))
                        : React.createElement('p', { className: 'no-products' }, 'Không tìm thấy sản phẩm phù hợp.')
                ),
                // -- Pagination --
                React.createElement(
                    'nav', { className: 'pagination' },
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

export default BackpackPage;