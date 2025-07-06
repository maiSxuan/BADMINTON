// ShoePage.js
import React, { useState, useMemo } from 'react';
import './Outline.css'; // Giả sử bạn dùng chung file CSS

// --- DỮ LIỆU ---

// BƯỚC 2: Tạo hằng số cho các bộ lọc
const brands = ["Yonex", "Lining", "Victor", "Mizuno", "Kawasaki"];
const sizes = [38, 39, 40, 41, 42, 43, 44, 45];
const branches = ["SCD Premium", "SCD Quận 1", "SCD Quận 3", "SCD Quận 5", "SCD Quận 7", "SCD Quận 8"];

const priceRanges = {
    'range1': { min: 0, max: 1000000 },
    'range2': { min: 1000000, max: 1500000 },
    'range3': { min: 1500000, max: 2000000 },
    'range4': { min: 2000000, max: Infinity }
};

// BƯỚC 1: Dữ liệu mock với cấu trúc 'inStockAt' mới
const allMockProducts = [
    { id: 21, name: "Giày Cầu Lông Yonex 65Z3 Trắng", price: 2150000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/giay-cau-long-yonex-shb-65z3-men-trang-chinh-hang_1672300735.webp", inStockAt: { '40': ["SCD Quận 1", "SCD Quận 3"], '41': ["SCD Premium"], '42': ["SCD Quận 1", "SCD Quận 5", "SCD Quận 7"] } },
    { id: 22, name: "Giày Cầu Lông Lining AYAT005-3S", price: 1350000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/giay-cau-long-lining-ayat005-3s-chinh-hang_1680164894.webp", inStockAt: { '39': ["SCD Quận 5"], '40': ["SCD Quận 7", "SCD Quận 8"] } },
    { id: 23, name: "Giày Cầu Lông Victor A970ACE", price: 3200000, brand: "Victor", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/giay-cau-long-victor-a970ace-af-trang-chinh-hang_1677488347.webp", inStockAt: { '41': ["SCD Premium"], '42': ["SCD Premium"], '43': ["SCD Quận 3"] } },
    { id: 24, name: "Giày Cầu Lông Mizuno Wave Claw Neo 2", price: 2950000, brand: "Mizuno", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/giay-cau-long-mizuno-wave-claw-neo-2-trang-xanh-chinh-hang_1688719266.webp", inStockAt: { '40': ["SCD Quận 1"], '41': [], '42': ["SCD Quận 5"] } }, // Size 41 hết hàng
    { id: 25, name: "Giày Cầu Lông Kawasaki K088", price: 890000, brand: "Kawasaki", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/giay-cau-long-kawasaki-k088-trang-xanh-chinh-hang_1623832717.webp", inStockAt: { '38': ["SCD Quận 7"], '39': ["SCD Quận 8"] } },
];


function ShoePage() {
    // BƯỚC 3: Mở rộng State
    const [filters, setFilters] = useState({ 
        price: null, 
        brands: [],
        size: null,
        branches: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    // BƯỚC 5: Cập nhật logic lọc
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
        
        // Lọc theo size: Giữ lại sản phẩm nếu nó CÓ size người dùng chọn
        if (filters.size) {
            products = products.filter(p => 
                p.inStockAt.hasOwnProperty(filters.size) && p.inStockAt[filters.size].length > 0
            );
        }

        // Lọc theo chi nhánh (phụ thuộc vào size đã chọn)
        if (filters.branches.length > 0) {
            products = products.filter(p => {
                // Nếu người dùng đã chọn size, chỉ tìm trong các chi nhánh có size đó
                if (filters.size) {
                    return p.inStockAt[filters.size]?.some(branch => filters.branches.includes(branch));
                } 
                // Nếu chưa chọn size, tìm ở bất kỳ chi nhánh nào có bất kỳ size nào
                else {
                    const allAvailableBranches = Object.values(p.inStockAt).flat();
                    return allAvailableBranches.some(branch => filters.branches.includes(branch));
                }
            });
        }

        return products;
    }, [filters]);

    // TÍNH TOÁN PHÂN TRANG
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // BƯỚC 4: Tạo các hàm xử lý sự kiện
    // Dùng factory function cho gọn
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
    const handleSizeChange = handleFilterChange('size');
    const handleBranchChange = handleFilterChange('branches', true);
    
    // BƯỚC 6: Render UI
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
                        Object.keys(priceRanges).map((key) => React.createElement('li', { key }, React.createElement('label', null,
                            React.createElement('input', { type: 'radio', name: 'price', value: key, onChange: handlePriceChange }),
                             // Hiển thị dải giá
                             ` ${priceRanges[key].min.toLocaleString()}đ - ${priceRanges[key].max === Infinity ? 'trở lên' : priceRanges[key].max.toLocaleString() + 'đ'}`
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
                    React.createElement('h3', null, 'KÍCH CỠ CÓ HÀNG'),
                    React.createElement('ul', null, 
                        sizes.map(size => React.createElement('li', { key: size }, React.createElement('label', null,
                            React.createElement('input', { type: 'radio', name: 'size', value: size, onChange: handleSizeChange }),
                            ` Size ${size}`
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
                React.createElement('h1', { className: 'page-title' }, 'GIÀY CẦU LÔNG'),
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
                React.createElement( 'nav', { className: 'pagination' }, /* ... code phân trang giữ nguyên ... */ )
            )
        )
    );
}

export default ShoePage;