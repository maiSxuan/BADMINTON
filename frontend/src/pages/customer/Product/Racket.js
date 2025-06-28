// ProductPage.js
import React, { useState, useMemo } from 'react';
import './Outline.css'; // Import file CSS

// Dữ liệu giả lập - Trong dự án thật, bạn sẽ lấy từ API
const allMockProducts = [
    { id: 1, name: "Vợt Cầu Lông Victor Thruster Ryuga Metallic", price: 3980000, brand: "Victor", imageUrl: "https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-tk-ryuga-metallic-chinh-hang_1702259879.webp" },
    { id: 2, name: "Vợt Cầu Lông Lining Halbertec 5000", price: 1380000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-lining-halbertec-5000-chinh-hang_1685418193.webp" },
    { id: 3, name: "Vợt Cầu Lông Victor Thruster Ryuga II TD", price: 2100000, brand: "Victor", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-victor-thruster-ryuga-2-td_1688461750.webp" },
    { id: 4, name: "Vợt Cầu Lông Lining Axforce 90 New", price: 4348000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-lining-axforce-90-max-xanh-dragon-noi-dia_1669280961.webp" },
    { id: 5, name: "Vợt Cầu Lông Kumpoo YangZhiNew", price: 930000, brand: "Kumpoo", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-kumpoo-yangzhinew-noi-dia-trung_1685093780.webp" },
    { id: 6, name: "Vợt Cầu Lông Lining Axforce 80", price: 3300000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-lining-axforce-80-chen-long-noi-dia_1659929854.webp" },
    { id: 7, name: "Vợt Cầu Lông Yonex Astrox 100ZZ Kurenai", price: 5079000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-yonex-astrox-100zz-kurenai-chinh-hang_1625732168.webp" },
    { id: 8, name: "Vợt Cầu Lông Yonex Nanoflare 700 Pro", price: 4300000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-yonex-nanoflare-700-pro-noi-dia-nhat_1694077673.webp" },
    { id: 9, name: "Vợt Cầu Lông Lining Axforce Cannon", price: 980000, brand: "Lining", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-lining-axforce-cannon-trang-chinh-hang_1691395560.webp" },
    { id: 10, name: "Vợt Cầu Lông Mizuno Atlas S.1", price: 2880000, brand: "Mizuno", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-mizuno-atlas-s1-chinh-hang_1694073867.webp" },
    { id: 11, name: "Vợt Cầu Lông Yonex LD Force 2019", price: 2740000, brand: "Yonex", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-yonex-voltric-ld-force-2019-den-chinh-hang_1625801732.webp" },
    { id: 12, name: "Vợt Cầu Lông Proace Stroke 318II", price: 1000000, brand: "Proace", imageUrl: "https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-proace-stroke-318-ii-chinh-hang_1639039019.webp" }
];

const priceRanges = {
    'range1': { min: 0, max: 500000 },
    'range2': { min: 500000, max: 1000000 },
    'range3': { min: 1000000, max: 2000000 },
    'range4': { min: 2000000, max: 3000000 },
    'range5': { min: 3000000, max: Infinity }
};

const brands = ["Yonex", "Lining", "Victor", "Mizuno", "Adidas", "Proace"];

function RacketPage() {
    const [filters, setFilters] = useState({ price: null, brands: [] });
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
                )
            ),
            // --- PRODUCT CONTENT ---
            React.createElement(
                'section',
                { className: 'product-content' },
                React.createElement('h1', { className: 'page-title' }, 'VỢT CẦU LÔNG'),
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

export default RacketPage;