// Racket.js
import React, { useState, useMemo } from 'react';
import './Outline.css'; // Import file CSS

// BƯỚC 2: Tạo các hằng số cho bộ lọc mới
const stiffnessOptions = ["Siêu cứng", "Cứng", "Trung bình", "Dẻo"];
const playingStyles = ["Thiên công", "Công thủ toàn diện", "Thiên thủ"];
const branches = ["SCD Premium", "SCD Quận 1", "SCD Quận 3", "SCD Quận 5", "SCD Quận 7", "SCD Quận 8"];

// BƯỚC 1: Cập nhật dữ liệu mock với các thuộc tính mới
const allMockProducts = [
    { id: 1, name: "Vợt Cầu Lông Victor Thruster Ryuga Metallic", price: 3980000, brand: "Victor", imageUrl: "...", stiffness: "Cứng", style: "Thiên công", inStockAt: ["SCD Premium", "SCD Quận 3"] },
    { id: 2, name: "Vợt Cầu Lông Lining Halbertec 5000", price: 1380000, brand: "Lining", imageUrl: "...", stiffness: "Dẻo", style: "Công thủ toàn diện", inStockAt: ["SCD Quận 1", "SCD Quận 7"] },
    { id: 3, name: "Vợt Cầu Lông Victor Thruster Ryuga II TD", price: 2100000, brand: "Victor", imageUrl: "...", stiffness: "Trung bình", style: "Thiên công", inStockAt: ["SCD Quận 5", "SCD Quận 8"] },
    { id: 4, name: "Vợt Cầu Lông Lining Axforce 90 New", price: 4348000, brand: "Lining", imageUrl: "...", stiffness: "Siêu cứng", style: "Thiên công", inStockAt: ["SCD Premium"] },
    { id: 5, name: "Vợt Cầu Lông Kumpoo YangZhiNew", price: 930000, brand: "Kumpoo", imageUrl: "...", stiffness: "Dẻo", style: "Thiên thủ", inStockAt: [] },
    { id: 6, name: "Vợt Cầu Lông Lining Axforce 80", price: 3300000, brand: "Lining", imageUrl: "...", stiffness: "Cứng", style: "Thiên công", inStockAt: ["SCD Quận 1", "SCD Quận 3", "SCD Quận 5"] },
    { id: 7, name: "Vợt Cầu Lông Yonex Astrox 100ZZ Kurenai", price: 5079000, brand: "Yonex", imageUrl: "...", stiffness: "Siêu cứng", style: "Thiên công", inStockAt: ["SCD Premium", "SCD Quận 7"] },
    { id: 8, name: "Vợt Cầu Lông Yonex Nanoflare 700 Pro", price: 4300000, brand: "Yonex", imageUrl: "...", stiffness: "Trung bình", style: "Công thủ toàn diện", inStockAt: ["SCD Quận 1", "SCD Quận 8"] },
    { id: 9, name: "Vợt Cầu Lông Lining Axforce Cannon", price: 980000, brand: "Lining", imageUrl: "...", stiffness: "Dẻo", style: "Công thủ toàn diện", inStockAt: ["SCD Quận 3", "SCD Quận 5", "SCD Quận 7"] },
    { id: 10, name: "Vợt Cầu Lông Mizuno Atlas S.1", price: 2880000, brand: "Mizuno", imageUrl: "...", stiffness: "Trung bình", style: "Thiên thủ", inStockAt: ["SCD Quận 1"] },
    { id: 11, name: "Vợt Cầu Lông Yonex LD Force 2019", price: 2740000, brand: "Yonex", imageUrl: "...", stiffness: "Cứng", style: "Công thủ toàn diện", inStockAt: [] },
    { id: 12, name: "Vợt Cầu Lông Proace Stroke 318II", price: 1000000, brand: "Proace", imageUrl: "...", stiffness: "Dẻo", style: "Công thủ toàn diện", inStockAt: ["SCD Quận 5", "SCD Quận 8"] }
];

const priceRanges = {
    'range1': { min: 0, max: 500000 },
    'range2': { min: 500000, max: 1000000 },
    'range3': { min: 1000000, max: 2000000 },
    'range4': { min: 2000000, max: 3000000 },
    'range5': { min: 3000000, max: Infinity }
};

const brands = ["Yonex", "Lining", "Victor", "Mizuno", "Adidas", "Proace", "Kumpoo"];

function RacketPage() {
    // BƯỚC 3: Mở rộng state với các bộ lọc mới
    const [filters, setFilters] = useState({ 
        price: null, 
        brands: [],
        stiffness: null,
        style: null,
        branches: []
    });
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
        
        // BƯỚC 5: Cập nhật logic lọc
        // Lọc theo độ cứng
        if (filters.stiffness) {
            products = products.filter(p => p.stiffness === filters.stiffness);
        }

        // Lọc theo lối đánh
        if (filters.style) {
            products = products.filter(p => p.style === filters.style);
        }

        // Lọc theo chi nhánh
        if (filters.branches.length > 0) {
            products = products.filter(p => p.inStockAt.some(branch => filters.branches.includes(branch)));
        }

        return products;
    }, [filters]);

    // TÍNH TOÁN PHÂN TRANG
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // BƯỚC 4: Tạo các hàm xử lý sự kiện mới
    const handleFilterChange = (filterName, isCheckbox = false) => (e) => {
        const { value, checked } = e.target;
        
        if (isCheckbox) {
            const currentValues = filters[filterName];
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter(item => item !== value);
            setFilters(prev => ({ ...prev, [filterName]: newValues }));
        } else {
            setFilters(prev => ({ ...prev, [filterName]: value }));
        }
        
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };
    
    // Sử dụng hàm factory để tạo các handler gọn hơn
    const handlePriceChange = handleFilterChange('price');
    const handleBrandChange = handleFilterChange('brands', true);
    const handleStiffnessChange = handleFilterChange('stiffness');
    const handleStyleChange = handleFilterChange('style');
    const handleBranchChange = handleFilterChange('branches', true);

    return React.createElement(
        'div', { className: 'container' },
        React.createElement(
            'main', { className: 'product-page-layout' },
            // --- SIDEBAR ---
            React.createElement(
                'aside', { className: 'sidebar' },
                // BƯỚC 6: Render các bộ lọc mới ra giao diện
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
                    React.createElement('h3', null, 'ĐỘ CỨNG'),
                    React.createElement('ul', null, 
                        stiffnessOptions.map(stiff => React.createElement('li', { key: stiff }, React.createElement('label', null,
                            React.createElement('input', { type: 'radio', name: 'stiffness', value: stiff, onChange: handleStiffnessChange }),
                            ` ${stiff}`
                        )))
                    )
                ),
                React.createElement(
                    'div', { className: 'filter-group' },
                    React.createElement('h3', null, 'LỐI ĐÁNH'),
                    React.createElement('ul', null, 
                        playingStyles.map(style => React.createElement('li', { key: style }, React.createElement('label', null,
                            React.createElement('input', { type: 'radio', name: 'style', value: style, onChange: handleStyleChange }),
                            ` ${style}`
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
                React.createElement('h1', { className: 'page-title' }, 'VỢT CẦU LÔNG'),
                // ... (Phần hiển thị sản phẩm và phân trang giữ nguyên)
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

export default RacketPage;