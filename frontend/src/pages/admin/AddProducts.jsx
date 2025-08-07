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
    const [initialClassificationData, setInitialClassificationData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [formErrors, setFormErrors] = useState({});
    const [classificationError, setClassificationError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const latestClassificationData = useRef(classificationData);
    const brandInputRef = useRef();
    const categoryInputRef = useRef();

    // --- EFFECTS ---
    useEffect(() => {
        latestClassificationData.current = classificationData;
    }, [classificationData]);

    useEffect(() => {
        setIsLoading(!!slug);
        if (!slug) {
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

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([getAllCategories(), getAllBrands()]);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu master:", err.message);
            }
        };
        fetchMasterData();
    }, []);

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

useEffect(() => {
    if (!isEditMode) return;

    const fetchAndPopulateProduct = async (productSlug) => {
        setIsLoading(true);
        try {
            const product = await getProductBySlug(productSlug,'admin');
            
            // Điền thông tin cơ bản
            setProductName(product.name);
            setDescription(product.description);
            setCoverImage({ url: product.thumbnail_url, public_id: getPublicIdFromUrl(product.thumbnail_url) });
            // Sửa lỗi: Đảm bảo brand và category_ids tồn tại trước khi truy cập
            if (product.brand) { 
                setSelectedBrandId(product.brand._id); 
                setBrandInput(product.brand.name); 
            }
            if (product.category_ids && product.category_ids[0]) { 
                setSelectedCategoryId(product.category_ids[0]._id); 
                setCategoryInput(product.category_ids[0].name); 
            }
            
            // --- LOGIC TÁI CẤU TRÚC DỮ LIỆU ĐÃ SỬA LỖI ---
            if (product.classification_config?.length > 0 && product.variants?.length > 0) {
                const tempConfigs = [...product.classification_config];
                while (tempConfigs.length < 2) { tempConfigs.push({ name: "" }); }
                
                const [primaryConfig, secondaryConfig] = tempConfigs;
                
                // Lấy tất cả các lựa chọn duy nhất
                const primaryOptionNames = Array.from(new Set(product.variants.map(v => v.name)));
                const secondaryOptionNames = Array.from(new Set(product.variants.flatMap(v => v.options.map(o => o.value))));
                
                // *** FIX: TẠO BẢN ĐỒ ID CHO CÁC LỰA CHỌN PHỤ ĐỂ ĐẢM BẢO NHẤT QUÁN ***
                const secondaryOptionIdMap = new Map(
                    secondaryOptionNames.map(name => [name, Date.now() + Math.random()])
                );

                // Xây dựng cấu trúc localClassifications hoàn chỉnh
                const newClassifications = [
                    {
                        id: 1,
                        name: primaryConfig.name,
                        options: primaryOptionNames.map(pOptName => {
                            const dbPrimaryVariant = product.variants.find(v => v.name === pOptName);
                            return {
                                id: Date.now() + Math.random(), // ID cho lựa chọn chính có thể ngẫu nhiên
                                name: pOptName,
                                selected: true,
                                images: (dbPrimaryVariant.images || []).map(url => ({ url, public_id: getPublicIdFromUrl(url) })),
                                // Dữ liệu lồng nhau
                                options: secondaryOptionNames.map(sOptName => {
                                    const dbSecondaryOption = dbPrimaryVariant.options.find(o => o.value === sOptName);
                                    return {
                                        // *** FIX: SỬ DỤNG ID TỪ BẢN ĐỒ ***
                                        id: secondaryOptionIdMap.get(sOptName), 
                                        name: sOptName,
                                        price: dbSecondaryOption?.price ?? '',
                                        stock: dbSecondaryOption?.stock_quantity ?? '',
                                        sku: dbSecondaryOption?.sku_code ?? ''
                                    }
                                })
                            }
                        })
                    },
                    {
                        id: 2,
                        name: secondaryConfig.name,
                        options: secondaryOptionNames.map(sOptName => ({
                             // *** FIX: SỬ DỤNG ID TỪ BẢN ĐỒ ***
                            id: secondaryOptionIdMap.get(sOptName),
                            name: sOptName,
                            selected: true,
                        }))
                    }
                ];

                // Đặt cấu trúc hoàn chỉnh này làm dữ liệu ban đầu
                setInitialClassificationData({ classifications: newClassifications });
            }
            // --- KẾT THÚC LOGIC SỬA LỖI ---

        } catch (error) {
            console.error("Lỗi khi tải và điền dữ liệu sản phẩm:", error);
            alert(`Không thể tải dữ liệu sản phẩm: ${error.message}`);
            navigate('/admin/all-products');
        } finally {
            setIsLoading(false);
        }
    };

    fetchAndPopulateProduct(slug);
}, [slug, isEditMode, navigate]);

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
        setCategoryInput(category.name); setSelectedCategoryId(category._id); setShowCategorySuggestions(false); setFormErrors(prev => ({ ...prev, category: null }));
    };
    const handleAddNewCategory = async (name) => {
        try { const newCategory = await createCategoryByName(name); setCategories([...categories, newCategory]); handleSelectCategory(newCategory); } catch (err) { alert("Không thể thêm ngành hàng mới"); }
    };
    const handleSelectBrand = (brand) => {
        setBrandInput(brand.name); setSelectedBrandId(brand._id); setShowBrandSuggestions(false); setFormErrors(prev => ({ ...prev, brand: null }));
    };
    const handleAddNewBrand = async (name) => {
        try { const newBrand = await createBrandByName(name); setBrands([...brands, newBrand]); handleSelectBrand(newBrand); } catch (err) { alert("Không thể thêm thương hiệu mới"); }
    };
    const handleCoverImageUpload = async (event) => {
        const file = event.target.files[0]; if (!file) return; if (coverImage.public_id) { try { await deleteImage(coverImage.public_id); } catch (error) { console.error("Lỗi khi xóa ảnh bìa cũ:", error.message); } }
        try { const data = await uploadImage(file); setCoverImage(data); setFormErrors(prev => ({ ...prev, coverImage: null })); } catch (error) { alert(error.message); }
    };
    const handleCoverImageRemove = async (e) => {
        e.stopPropagation(); if (!coverImage.public_id) { setCoverImage({ url: null, public_id: null }); return; }
        try { await deleteImage(coverImage.public_id); setCoverImage({ url: null, public_id: null }); } catch (error) { alert("Lỗi khi xóa ảnh: " + error.message); }
    };

    // --- VALIDATION & SUBMIT ---
    const validateForm = (data) => {
        const newErrors = {};
        let clsError = null;

        if (!productName.trim()) newErrors.productName = "Vui lòng nhập Tên sản phẩm.";
        if (!selectedBrandId) newErrors.brand = "Vui lòng chọn một Thương hiệu.";
        if (!selectedCategoryId) newErrors.category = "Vui lòng chọn một Ngành hàng.";
        if (!coverImage.url) newErrors.coverImage = "Bạn cần tải lên ảnh đại diện.";

        const { config, variants } = data;
        const primaryConfig = config.length > 0 ? config[0] : { name: '' };
        const secondaryConfig = config.length > 1 ? config[1] : { name: '' };

        if (!primaryConfig.name.trim()) {
            clsError = "Vui lòng đặt tên cho Phân loại 1.";
        } else if (variants.length === 0) {
            clsError = `Vui lòng thêm ít nhất một lựa chọn cho "${primaryConfig.name}".`;
        } else {
            for (const variant of variants) {
                if (!variant.name.trim()) {
                    clsError = `Vui lòng nhập tên cho tất cả lựa chọn ở "${primaryConfig.name}".`; break;
                }
                if (!variant.images || variant.images.length === 0) {
                    clsError = `Mỗi lựa chọn ở "${primaryConfig.name}" (ví dụ: "${variant.name}") phải có ít nhất một hình ảnh.`; break;
                }
            }
            if (!clsError) {
                if (!secondaryConfig.name.trim()) {
                    clsError = "Bạn chưa thiết lập Phân loại 2. Vui lòng đặt tên hoặc thêm lựa chọn cho nó.";
                } else if (!variants.every(v => v.options && v.options.length > 0)) {
                    clsError = `Vui lòng thêm ít nhất một lựa chọn cho "${secondaryConfig.name}".`;
                } else {
                    for (const variant of variants) {
                        for (const option of variant.options) {
                            if (!option.value.trim()) {
                                clsError = `Vui lòng nhập tên cho tất cả lựa chọn ở "${secondaryConfig.name}".`; break;
                            }
                            if (option.price === null || option.price === '' || Number(option.price) <= 0) {
                                clsError = `Giá của phiên bản "${variant.name} - ${option.value}" phải lớn hơn 0.`; break;
                            }
                            
                            // START: ĐIỀU KIỆN KIỂM TRA KHO HÀNG ĐÃ SỬA
                            const stockValue = option.stock_quantity;
                            const stockNumber = Number(stockValue);

                            if (stockValue === null || stockValue === '' || isNaN(stockNumber) || stockNumber < 0) {
                                clsError = `Kho hàng của phiên bản "${variant.name} - ${option.value}" phải là số không âm và không được để trống.`;
                                break;
                            }
                            // END: ĐIỀU KIỆN KIỂM TRA KHO HÀNG ĐÃ SỬA
                            
                            if (!option.sku_code || !option.sku_code.trim()) {
                                clsError = `SKU của phiên bản "${variant.name} - ${option.value}" không được để trống.`; break;
                            }
                        }
                        if (clsError) break;
                    }
                }
            }
        }

        setFormErrors(newErrors);
        setClassificationError(clsError);

        if (Object.keys(newErrors).length > 0) { setActiveTab('basic'); return false; }
        if (clsError) { setActiveTab('sales'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentData = latestClassificationData.current;
        setSubmitError(null);
        setFormErrors({});
        setClassificationError(null);

        setTimeout(() => {
            if (!validateForm(currentData)) {
                setSubmitError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường được báo lỗi.");
                return;
            }
            const submitData = async () => {
                setIsSubmitting(true);
                try {
                    const productPayload = {
                        name: productName, description, brand: selectedBrandId, category_ids: [selectedCategoryId],
                        thumbnail_url: coverImage.url, classification_config: currentData.config, variants: currentData.variants,
                    };
                    if (isEditMode) {
                        await editProduct(slug, productPayload);
                        alert(`Cập nhật sản phẩm thành công.`);
                    } else {
                        await addProduct(productPayload);
                        alert(`Tạo sản phẩm thành công.`);
                    }
                    navigate('/admin/all-products');
                } catch (error) {
                    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra.';
                    setSubmitError(message);
                } finally {
                    setIsSubmitting(false);
                }
            };
            submitData();
        }, 0);
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
                        <label className="form-label">Ảnh bìa *</label>
                        <div className="form-control">
                            <div className="cover-image-uploader" onClick={() => document.getElementById('cover-image-input').click()}>
                                {coverImage.url ? (<div className="image-preview-container"> <img src={coverImage.url} alt="Ảnh bìa" className="uploaded-image" /> <button type="button" className="remove-image-btn" onClick={handleCoverImageRemove}>×</button> </div>) : (<div className="image-upload-placeholder"><span>Thêm ảnh</span></div>)}
                                <input id="cover-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverImageUpload} />
                            </div>
                            {formErrors.coverImage && <div className="error-message">{formErrors.coverImage}</div>}
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label">Tên sản phẩm *</label>
                        <div className="form-control">
                            <input type="text" className={`form-input ${formErrors.productName ? 'input-error' : ''}`} value={productName} onChange={(e) => { setProductName(e.target.value); if (formErrors.productName) setFormErrors(p => ({ ...p, productName: null })); }} />
                            {formErrors.productName && <div className="error-message">{formErrors.productName}</div>}
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label">Thương hiệu *</label>
                        <div className="form-control autocomplete-wrapper" ref={brandInputRef}>
                            <input type="text" className={`form-input ${formErrors.brand ? 'input-error' : ''}`} value={brandInput} onFocus={() => setShowBrandSuggestions(true)} onChange={(e) => { setBrandInput(e.target.value); setShowBrandSuggestions(true); setSelectedBrandId(''); if (formErrors.brand) setFormErrors(p => ({ ...p, brand: null })); }} />
                            {showBrandSuggestions && (<ul className="autocomplete-suggestions"> {filteredBrands.map((brand) => (<li key={brand._id} onClick={() => handleSelectBrand(brand)}>{brand.name}</li>))} {filteredBrands.length === 0 && brandInput && (<li className="add-new" onClick={() => handleAddNewBrand(brandInput)}>+ Thêm mới: "{brandInput}"</li>)} </ul>)}
                            {formErrors.brand && <div className="error-message">{formErrors.brand}</div>}
                        </div>
                    </div>
                    <div className="form-row">
                        <label className="form-label">Ngành hàng *</label>
                        <div className="form-control autocomplete-wrapper" ref={categoryInputRef}>
                            <input type="text" className={`form-input ${formErrors.category ? 'input-error' : ''}`} value={categoryInput} onFocus={() => setShowCategorySuggestions(true)} onChange={(e) => { setCategoryInput(e.target.value); setShowCategorySuggestions(true); setSelectedCategoryId(''); if (formErrors.category) setFormErrors(p => ({ ...p, category: null })); }} />
                            {showCategorySuggestions && (<ul className="autocomplete-suggestions"> {filteredCategories.map((cat) => (<li key={cat._id} onClick={() => handleSelectCategory(cat)}>{cat.name}</li>))} {filteredCategories.length === 0 && categoryInput && (<li className="add-new" onClick={() => handleAddNewCategory(categoryInput)}>+ Thêm mới: "{categoryInput}"</li>)} </ul>)}
                            {formErrors.category && <div className="error-message">{formErrors.category}</div>}
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
                        error={classificationError}
                    />
                </div>
            )}

            <div className="form-submit-row">
                {submitError && <div className="submit-error-message">{submitError}</div>}
                <button type="submit" className="final-save-btn" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')}
                </button>
            </div>
        </form>
    );
};

export default AddProducts;