// src/pages/admin/products/AddProducts.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductClassification from "./ProductClassification";
import './AddProducts.css';
import {
    getAllBrands, getAllCategories, createBrandByName, createCategoryByName,
    uploadImage, deleteImage, addProduct, editProduct, getProductBySlug
} from '../../services';

// Helper: Trích xuất public_id từ URL Cloudinary để có thể xóa ảnh
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 2).join('/');
        return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    } catch (e) {
        console.error("Không thể phân tích public_id từ URL:", url, e);
        return null;
    }
};

// Helper: Tạo state phân loại ban đầu cho chế độ "thêm mới"
const createInitialClassificationState = () => ([
    { id: 1, name: "", options: [] },
    { id: 2, name: "", options: [] },
]);

const AddProducts = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!slug;

    // --- STATE ---
    const [activeTab, setActiveTab] = useState("basic");
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState({ url: null, public_id: null });
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categoryInput, setCategoryInput] = useState('');
    const [brandInput, setBrandInput] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [classifications, setClassifications] = useState(createInitialClassificationState);
    const [classificationData, setClassificationData] = useState({ variants: [], config: [] });
    // State để chứa dữ liệu bảng giá ban đầu cho component con
    const [initialClassificationData, setInitialClassificationData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const brandInputRef = useRef();
    const categoryInputRef = useRef();

    // --- EFFECTS ---

    // Effect 1: Reset state khi slug thay đổi (quan trọng khi chuyển giữa các trang edit)
    useEffect(() => {
        setIsLoading(!!slug);
        if (!slug) { // Nếu là trang thêm mới, reset mọi thứ
            setProductName('');
            setDescription('');
            setCoverImage({ url: null, public_id: null });
            setCategoryInput('');
            setBrandInput('');
            setSelectedCategoryId('');
            setSelectedBrandId('');
            setClassifications(createInitialClassificationState());
            setClassificationData({ variants: [], config: [] });
            setInitialClassificationData(null);
            setActiveTab('basic');
        }
    }, [slug]);

    // Effect 2: Fetch dữ liệu master (brands, categories)
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([ getAllCategories(), getAllBrands() ]);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu master:", err.message);
            }
        };
        fetchMasterData();
    }, []);

    // Effect 3 & 4: Xử lý logic lọc cho autocomplete
    useEffect(() => {
        setFilteredBrands(
            brands.filter(brand => brand.name.toLowerCase().includes(brandInput.toLowerCase()))
        );
    }, [brandInput, brands]);

    useEffect(() => {
        setFilteredCategories(
            categories.filter(cat => cat.name.toLowerCase().includes(categoryInput.toLowerCase()))
        );
    }, [categoryInput, categories]);

    // Effect 5: Fetch và điền dữ liệu sản phẩm chi tiết trong chế độ EDIT
    useEffect(() => {
        if (!isEditMode) return;

        const fetchAndPopulateProduct = async (productSlug) => {
            setIsLoading(true);
            try {
                const product = await getProductBySlug(productSlug, 'admin');
                
                // Điền thông tin cơ bản
                setProductName(product.name);
                setDescription(product.description);
                setCoverImage({ url: product.thumbnail_url, public_id: getPublicIdFromUrl(product.thumbnail_url) });
                if (product.brand) { setSelectedBrandId(product.brand._id); setBrandInput(product.brand.name); }
                if (product.category_ids && product.category_ids[0]) { setSelectedCategoryId(product.category_ids[0]._id); setCategoryInput(product.category_ids[0].name); }
                
                // Logic chính: Tái cấu trúc state cho component con
                if (product.classification_config?.length > 0 && product.variants?.length > 0 && product.classification_config[0].name !== 'Mặc định') {
                    const tempConfigs = [...product.classification_config];
                    while (tempConfigs.length < 2) { tempConfigs.push({ name: "" }); }

                    const newClassificationsState = tempConfigs.map((cfg, index) => {
                        let optionNames = new Set();
                        if (index === 0) { product.variants.forEach(v => optionNames.add(v.name)); }
                        else { product.variants.forEach(v => v.options.forEach(opt => optionNames.add(opt.value))); }
                        return {
                            id: index + 1, name: cfg.name,
                            options: Array.from(optionNames).map(optName => {
                                const primaryVariant = (index === 0) ? product.variants.find(v => v.name === optName) : null;
                                return {
                                    id: Date.now() + Math.random(), name: optName, selected: true,
                                    images: primaryVariant ? (primaryVariant.images || []).map(url => ({ url, public_id: getPublicIdFromUrl(url) })) : []
                                };
                            })
                        };
                    });
                    
                    const [primaryCls, secondaryCls] = newClassificationsState;
                    if (primaryCls?.options && secondaryCls?.options) {
                        const initialUiVariants = primaryCls.options.map(pOpt => {
                            const dbPrimaryVariant = product.variants.find(v => v.name === pOpt.name);
                            return {
                                id: pOpt.id, name: pOpt.name, images: pOpt.images,
                                options: secondaryCls.options.map(sOpt => {
                                    const dbSecondaryOption = dbPrimaryVariant?.options.find(o => o.value === sOpt.name);
                                    return {
                                        id: sOpt.id, name: sOpt.name,
                                        price: dbSecondaryOption?.price ?? '',
                                        stock: dbSecondaryOption?.stock_quantity ?? '',
                                        sku: dbSecondaryOption?.sku_code ?? ''
                                    };
                                })
                            };
                        });
                        
                        // Lưu dữ liệu ban đầu vào state để truyền cho component con
                        setInitialClassificationData({
                            classifications: newClassificationsState,
                            uiVariants: initialUiVariants
                        });
                    }
                    
                    setClassifications(newClassificationsState);
                }
            } catch (error) {
                alert(`Không thể tải dữ liệu sản phẩm: ${error.message}`);
                navigate('/admin/products');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAndPopulateProduct(slug);
    }, [slug, isEditMode, navigate]);

    // Effect 6: Đóng gợi ý khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (brandInputRef.current && !brandInputRef.current.contains(e.target)) setShowBrandSuggestions(false);
            if (categoryInputRef.current && !categoryInputRef.current.contains(e.target)) setShowCategorySuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // --- HANDLERS ---
    const handleClassificationChange = useCallback((data) => {
        setClassificationData(data);
    }, []);

    const handleSelectCategory = (category) => {
        setCategoryInput(category.name); setSelectedCategoryId(category._id); setShowCategorySuggestions(false);
    };
    const handleAddNewCategory = async (name) => {
        try { const newCategory = await createCategoryByName(name); setCategories([...categories, newCategory]); handleSelectCategory(newCategory); } catch (err) { alert("Không thể thêm ngành hàng mới"); }
    };
    const handleSelectBrand = (brand) => {
        setBrandInput(brand.name); setSelectedBrandId(brand._id); setShowBrandSuggestions(false);
    };
    const handleAddNewBrand = async (name) => {
        try { const newBrand = await createBrandByName(name); setBrands([...brands, newBrand]); handleSelectBrand(newBrand); } catch (err) { alert("Không thể thêm thương hiệu mới"); }
    };
    const handleCoverImageUpload = async (event) => {
        const file = event.target.files[0]; if (!file) return; if (coverImage.public_id) { try { await deleteImage(coverImage.public_id); } catch (error) { console.error("Lỗi khi xóa ảnh bìa cũ:", error.message); } }
        try { const data = await uploadImage(file); setCoverImage(data); } catch (error) { alert(error.message); }
    };
    const handleCoverImageRemove = async (e) => {
        e.stopPropagation(); if (!coverImage.public_id) { setCoverImage({ url: null, public_id: null }); return; }
        try { await deleteImage(coverImage.public_id); setCoverImage({ url: null, public_id: null }); } catch (error) { alert("Lỗi khi xóa ảnh: " + error.message); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName || !selectedBrandId || !selectedCategoryId) { alert("Vui lòng điền đầy đủ Tên sản phẩm, Thương hiệu và Ngành hàng."); return; }
        if (!coverImage.url) { alert('Bạn cần tải lên ảnh đại diện cho sản phẩm.'); return; }
        setIsSubmitting(true);
        try {
            const productPayload = {
                name: productName, description, brand: selectedBrandId, category_ids: [selectedCategoryId], thumbnail_url: coverImage.url,
                classification_config: classificationData.config, variants: classificationData.variants,
            };
            if (isEditMode) {
                const updatedProduct = await editProduct(slug, productPayload);
                alert(`Cập nhật sản phẩm thành công: ${updatedProduct.name}`); navigate('/admin/all-products');
            } else {
                const newProduct = await addProduct(productPayload);
                alert(`Tạo sản phẩm thành công: ${newProduct.name}`); navigate('/admin/all-products');
            }
        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) { return <div className="loading-message">Đang tải dữ liệu sản phẩm...</div>; }

    return (
        <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="form-header"> <h2>{isEditMode ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2> </div>
            <div className="tab-wrapper">
                <div className="tab-container">
                    <button type="button" onClick={() => setActiveTab("basic")} className={`tab-button ${activeTab === "basic" ? "active" : ""}`}>Thông tin cơ bản</button>
                    <button type="button" onClick={() => setActiveTab("sales")} className={`tab-button ${activeTab === "sales" ? "active" : ""}`}>Thông tin bán hàng</button>
                </div>
            </div>

            {activeTab === 'basic' && (
                <>
                    <div className="form-row">
                        <label className="form-label">Ảnh bìa</label>
                        <div className="form-control">
                            <div className="cover-image-uploader" onClick={() => document.getElementById('cover-image-input').click()}>
                                {coverImage.url ? (<div className="image-preview-container"> <img src={coverImage.url} alt="Ảnh bìa" className="uploaded-image" /> <button type="button" className="remove-image-btn" onClick={handleCoverImageRemove}>×</button> </div>) : ( <div className="image-upload-placeholder"><span>Thêm ảnh</span></div> )}
                                <input id="cover-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverImageUpload} />
                            </div>
                        </div>
                    </div>
                    <div className="form-row"> <label className="form-label">Tên sản phẩm</label> <div className="form-control"> <input type="text" className="form-input" value={productName} onChange={(e) => setProductName(e.target.value)} required /> </div> </div>
                    <div className="form-row">
                        <label className="form-label">Thương hiệu</label>
                        <div className="form-control autocomplete-wrapper" ref={brandInputRef}>
                            <input type="text" className="form-input" value={brandInput} onFocus={() => setShowBrandSuggestions(true)} onChange={(e) => { setBrandInput(e.target.value); setShowBrandSuggestions(true); }}/>
                            {showBrandSuggestions && (<ul className="autocomplete-suggestions"> {filteredBrands.map((brand) => (<li key={brand._id} onClick={() => handleSelectBrand(brand)}>{brand.name}</li>))} {filteredBrands.length === 0 && brandInput && (<li className="add-new" onClick={() => handleAddNewBrand(brandInput)}>+ Thêm mới: "{brandInput}"</li>)} </ul>)}
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label">Ngành hàng</label>
                        <div className="form-control autocomplete-wrapper" ref={categoryInputRef}>
                            <input type="text" className="form-input" value={categoryInput} onFocus={() => setShowCategorySuggestions(true)} onChange={(e) => { setCategoryInput(e.target.value); setShowCategorySuggestions(true); }} />
                            {showCategorySuggestions && (<ul className="autocomplete-suggestions"> {filteredCategories.map((cat) => (<li key={cat._id} onClick={() => handleSelectCategory(cat)}>{cat.name}</li>))} {filteredCategories.length === 0 && categoryInput && (<li className="add-new" onClick={() => handleAddNewCategory(categoryInput)}>+ Thêm mới: "{categoryInput}"</li>)} </ul>)}
                        </div>
                    </div>
                    <div className="form-row"> <label className="form-label">Mô tả sản phẩm</label> <div className="form-control"> <textarea className="form-textarea" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea> </div> </div>
                </>
            )}

            {activeTab === 'sales' && (
                <div className="sales-tab-wrapper">
                    <ProductClassification
                        initialClassifications={classifications}
                        initialData={initialClassificationData}
                        onClassificationsChange={setClassifications}
                        onDataChange={handleClassificationChange}
                    />
                </div>
            )}
            
            <div className="form-submit-row"> <button type="submit" className="final-save-btn" disabled={isSubmitting || isLoading}> {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')} </button> </div>
        </form>
    );
};

export default AddProducts;