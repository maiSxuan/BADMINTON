// import React, { useState,useEffect } from 'react';
// import ImageUploader from '../../components/common/ImageUploader';
// import './AddProducts.css';
// import ProductClassification from "./ProductClassification";

// const AddProducts = () => {
//   const [activeTab, setActiveTab] = useState("basic");
//   const [productName, setProductName] = useState('');
//   const [brandName, setBrandName] = useState(''); 
//   const [description, setDescription] = useState('');

//   const [categories, setCategories] = useState([]); 
//   const [selectedCategoryId, setSelectedCategoryId] = useState(''); 
//   const [isLoadingCategories, setIsLoadingCategories] = useState(true);

//   const [brands, setBrands] = useState([]);
//   const [selectedBrandId, setSelectedBrandId] = useState('');
//   const [isLoadingBrands, setIsLoadingBrands] = useState(true);

//     // Sử dụng useEffect đúng cách
//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 // Sửa lại URL thành http
//                 const response = await fetch("http://localhost:4000/api/categories");
//                 if (!response.ok) {
//                     throw new Error('Không thể tải danh sách ngành hàng');
//                 }
//                 const data = await response.json();
//                 setCategories(data); // Lưu mảng dữ liệu vào state categories
//             } catch (err) {
//                 console.error("Lỗi khi tải danh sách ngành hàng:", err);
//             } finally {
//                 setIsLoadingCategories(false);
//             }
//         };
//         const fetchBrands = async () => {
//           try {
//               setIsLoadingBrands(true);
//               const response = await fetch(`http://localhost:4000/api/brands`);
//               if (!response.ok) throw new Error('Không thể tải danh sách thương hiệu');
//               const data = await response.json();
//               setBrands(data);
//           } catch (err) {
//               console.error(err.message);
//           } finally {
//               setIsLoadingBrands(false);
//           }
//         };
//         fetchBrands();
//         fetchCategories();
//     }, []);
//   return (
//     <div className="add-product-form">
//       <div className="tab-wrapper">
//         <div className="tab-container">
//           <button
//             onClick={() => setActiveTab("basic")}
//             className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
//           >
//             Thông tin cơ bản
//           </button>
//           <button
//             onClick={() => setActiveTab("sales")}
//             className={`tab-button ${activeTab === "sales" ? "active" : ""}`}
//           >
//             Thông tin bán hàng
//           </button>
//         </div>
//       </div>
//       {activeTab === "basic" && (
//         <>
//           <div className="form-row">
//             <label className="form-label">Hình ảnh sản phẩm</label>
//             <div className="form-control">
//               <ImageUploader />
//               <div className="form-description">
//                 <p>Tỉ lệ ảnh 1:1</p>
//                 <p>Tối đa 10 ảnh</p>
//               </div>
//             </div>
//           </div>
//           <div className="form-row">
//             <label className="form-label">Ảnh bìa</label>
//             <div className="form-control">
//               <ImageUploader />
//               <div className="form-description">
//                 <p>Tỉ lệ ảnh 1:1</p>
//                 <p>Hình ảnh đại diện hiển thị trên cửa hàng</p>
//               </div>
//             </div>
//           </div>
//           <div className="form-row">
//             <label className="form-label" htmlFor="product-name">Tên sản phẩm</label>
//             <div className="form-control">
//               <input 
//                 type="text" 
//                 id="product-name" 
//                 className="form-input" 
//                 value={productName}
//                 onChange={(e) => setProductName(e.target.value)}
//               />
//             </div>
//           </div>
          
//             <div className="form-row">
//                 <label className="form-label" htmlFor="product-brand">Thương hiệu</label>
//                 <div className="form-control">
//                     <select
//                         id="product-brand"
//                         className="form-input"
//                         value={selectedBrandId}
//                         onChange={(e) => setSelectedBrandId(e.target.value)}
//                         disabled={isLoadingBrands}
//                     >
//                         <option value="">
//                             {isLoadingBrands ? "Đang tải..." : "-- Chọn thương hiệu --"}
//                         </option>
//                         {brands.map((brand) => (
//                             <option key={brand._id} value={brand._id}>
//                                 {brand.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//           {/* Ngành hàng */}
//            <div className="form-row">
//               <label className="form-label" htmlFor="product-category">Ngành hàng</label>
//               <div className="form-control">
//                   <select 
//                       id="product-category" 
//                       className="form-input" // Có thể tạo class form-select riêng nếu muốn
//                       value={selectedCategoryId}
//                       onChange={(e) => setSelectedCategoryId(e.target.value)}
//                       disabled={isLoadingCategories}
//                   >
//                       <option value="">
//                           {isLoadingCategories ? "Đang tải..." : "-- Chọn ngành hàng --"}
//                       </option>
//                       {categories.map((cat) => (
//                           <option key={cat._id} value={cat._id}>
//                               {cat.name}
//                           </option>
//                       ))}
//                   </select>
//               </div>
//           </div>

//           {/* Mô tả sản phẩm */}
//           <div className="form-row">
//             <label className="form-label" htmlFor="product-description">Mô tả sản phẩm</label>
//             <div className="form-control">
//               <textarea 
//                 id="product-description" 
//                 className="form-textarea" 
//                 rows="5"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               ></textarea>
//             </div>
//           </div>

//           {/* Phần Video sản phẩm đã được xóa bỏ */}
//         </>
//       )}

//       {activeTab === "sales" && (
//         <div className="sales-tab-wrapper">
//           <ProductClassification />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddProducts;
import React, { useState, useEffect } from 'react';
import ImageUploader from '../../components/common/ImageUploader';
import ProductClassification from "./ProductClassification";
// KHÔNG CẦN IMPORT TỪ API SERVICE NỮA
import './AddProducts.css';

const API_URL = 'http://localhost:4000/api';

// --- HÀM GỌI API ĐƯỢC ĐẶT TRỰC TIẾP TẠI ĐÂY ---
const createNewProduct = async (productData) => {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Tạo sản phẩm thất bại.');
        }

        return await response.json();
    } catch (error) {
        // Ném lỗi ra để component có thể bắt và hiển thị
        throw error;
    }
};


const AddProducts = () => {
    const [activeTab, setActiveTab] = useState("basic");

    // State cho tab thông tin cơ bản
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState('');

    // State cho ảnh
    const [thumbnail, setThumbnail] = useState({ url: '', public_id: '' });
    const [images, setImages] = useState([]);

    // State cho việc tải dữ liệu dropdown
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [brands, setBrands] = useState([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(true);

    // State cho tab thông tin bán hàng
    const [variantsData, setVariantsData] = useState([]);

    // State chung
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, brandsRes] = await Promise.all([
                    fetch(`${API_URL}/categories`),
                    fetch(`${API_URL}/brands`)
                ]);

                if (!categoriesRes.ok) throw new Error('Không thể tải ngành hàng');
                if (!brandsRes.ok) throw new Error('Không thể tải thương hiệu');

                const categoriesData = await categoriesRes.json();
                const brandsData = await brandsRes.json();

                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err.message);
            } finally {
                setIsLoadingCategories(false);
                setIsLoadingBrands(false);
            }
        };

        fetchData();
    }, []);

    // Hàm callback để nhận dữ liệu từ ProductClassification
    const handleClassificationChange = (data) => {
        setVariantsData(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Logic định dạng dữ liệu variants
            // Cần được điều chỉnh để khớp với dữ liệu thực tế từ ProductClassification
            const formattedVariants = variantsData.length > 0
                ? variantsData.map(variantGroup => ({
                    name: variantGroup.name || "Default",
                    price: 0,
                    list_price: 0,
                    thumbnail_url: thumbnail.url,
                    images: images.map(img => img.url),
                    options: variantGroup.options.filter(opt => opt.name).map(opt => ({
                        sku_code: opt.sku || `${productName.substring(0, 3).toUpperCase()}-${opt.name}`,
                        size: opt.name,
                        price: Number(opt.price) || 0,
                        stock_quantity: Number(opt.stock) || 0,
                    }))
                }))
                : [{ // Tạo variant mặc định nếu không có phân loại
                    name: "Default",
                    price: 0, 
                    list_price: 0,
                    thumbnail_url: thumbnail.url,
                    images: images.map(img => img.url),
                    options: []
                }];

            const productPayload = {
                name: productName,
                description,
                brand: selectedBrandId,
                category_ids: selectedCategoryId ? [selectedCategoryId] : [],
                variants: formattedVariants,
            };

            console.log("Dữ liệu chuẩn bị gửi đi:", productPayload);

            // Gọi hàm createNewProduct đã được định nghĩa ở trên
            const newProduct = await createNewProduct(productPayload);
            alert(`Tạo sản phẩm thành công: ${newProduct.name}`);
            
            // Có thể reset form tại đây nếu muốn

        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="tab-wrapper">
                <div className="tab-container">
                    <button type="button" onClick={() => setActiveTab("basic")} className={`tab-button ${activeTab === "basic" ? "active" : ""}`}>
                        Thông tin cơ bản
                    </button>
                    <button type="button" onClick={() => setActiveTab("sales")} className={`tab-button ${activeTab === "sales" ? "active" : ""}`}>
                        Thông tin bán hàng
                    </button>
                </div>
            </div>

            {activeTab === "basic" && (
                <>
                    <div className="form-row">
                        <label className="form-label">Ảnh bìa</label>
                        <div className="form-control">
                            <ImageUploader
                                onUploadSuccess={(imageInfo) => setThumbnail(imageInfo)}
                                onImageRemove={() => setThumbnail({ url: '', public_id: '' })}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label" htmlFor="product-name">Tên sản phẩm</label>
                        <div className="form-control">
                            <input type="text" id="product-name" className="form-input" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label" htmlFor="product-brand">Thương hiệu</label>
                        <div className="form-control">
                            <select id="product-brand" className="form-input" value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)} disabled={isLoadingBrands} required>
                                <option value="">{isLoadingBrands ? "Đang tải..." : "-- Chọn thương hiệu --"}</option>
                                {brands.map((brand) => (<option key={brand._id} value={brand._id}>{brand.name}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label" htmlFor="product-category">Ngành hàng</label>
                        <div className="form-control">
                            <select id="product-category" className="form-input" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} disabled={isLoadingCategories} required>
                                <option value="">{isLoadingCategories ? "Đang tải..." : "-- Chọn ngành hàng --"}</option>
                                {categories.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label" htmlFor="product-description">Mô tả sản phẩm</label>
                        <div className="form-control">
                            <textarea id="product-description" className="form-textarea" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "sales" && (
                <div className="sales-tab-wrapper">
                    <ProductClassification onDataChange={handleClassificationChange} />
                </div>
            )}
            
            <div className="form-submit-row">
                <button type="submit" className="final-save-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
            </div>
        </form>
    );
};

export default AddProducts;