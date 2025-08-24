import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductClassification from "./ProductClassification";
import './AddProducts.css';
import {
    getAllBrands, getAllCategories, createBrandByName, createCategoryByName,
    uploadImage, deleteImage, addProduct, editProduct, getProductBySlug
} from '../../services';
import { usePopup } from '../../components/common/popupContext';
const CHAR_LIMITS = {
    NAME: 200,
    DESCRIPTION: 5000,
    BRAND: 100,      
    CATEGORY: 100,  
    CLASSIFICATION_NAME: 50,
    OPTION_VALUE: 100,
    SKU: 50,
};
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 2).join('/');
        return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    } catch (e) {
        console.error("Cannot parse public_id from URL:", url, e);
        return null;
    }
};
const createInitialClassificationState = () => ([
    { id: 1, name: "", options: [] },
    { id: 2, name: "", options: [] },
]);

const AddProducts = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!slug;
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

    const { showPopup } = usePopup();
    
    const latestClassificationData = useRef(classificationData);
    const brandInputRef = useRef();
    const categoryInputRef = useRef();

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
                console.error("Error fetching master data:", err.message);
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
                const product = await getProductBySlug(productSlug, 'admin');
                setProductName(product.name);
                setDescription(product.description);
                setCoverImage({ url: product.thumbnail_url, public_id: getPublicIdFromUrl(product.thumbnail_url) });
                
                if (product.brand) {
                    setSelectedBrandId(product.brand._id);
                    setBrandInput(product.brand.name);
                }
                if (product.category_ids && product.category_ids[0]) {
                    setSelectedCategoryId(product.category_ids[0]._id);
                    setCategoryInput(product.category_ids[0].name);
                }

                if (product.classification_config?.length > 0 && product.variants?.length > 0) {
                    const tempConfigs = [...product.classification_config];
                    while (tempConfigs.length < 2) { tempConfigs.push({ name: "" }); }
                    const optionIdMap = new Map();
                    const getOptionId = (name) => {
                        if (!optionIdMap.has(name)) {
                            optionIdMap.set(name, Date.now() + Math.random());
                        }
                        return optionIdMap.get(name);
                    };
                    const newClassificationsState = tempConfigs.map((cfg, index) => {
                        let optionNames = new Set();
                        if (index === 0) {
                            product.variants.forEach(v => optionNames.add(v.name));
                        } else {
                            product.variants.forEach(v => v.options.forEach(opt => optionNames.add(opt.value)));
                        }
                        return {
                            id: index + 1,
                            name: cfg.name,
                            options: Array.from(optionNames).map(optName => {
                                const primaryVariant = (index === 0) ? product.variants.find(v => v.name === optName) : null;
                                return {
                                    id: getOptionId(optName),
                                    name: optName,
                                    selected: true,
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
                                id: pOpt.id, 
                                name: pOpt.name,
                                images: pOpt.images,
                                options: secondaryCls.options.map(sOpt => {
                                    const dbSecondaryOption = dbPrimaryVariant?.options.find(o => o.value === sOpt.name);
                                    return {
                                        id: sOpt.id, 
                                        name: sOpt.name,
                                        price: dbSecondaryOption?.price ?? '',
                                        stock: dbSecondaryOption?.stock_quantity ?? '',
                                        sku: dbSecondaryOption?.sku_code ?? ''
                                    };
                                })
                            };
                        });
                        
                        setInitialClassificationData({
                            classifications: newClassificationsState,
                            uiVariants: initialUiVariants
                        });
                    }
                    
                    setClassifications(newClassificationsState);
                }
            } catch (error) {
                console.error("Error fetching and populating product data:", error);
                showPopup(
                    'Lỗi',
                    error.message || 'Lỗi khi tải dữ liệu sản phẩm',
                    null,
                    null,
                    4,
                    1
                )
                navigate('/admin/all-products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndPopulateProduct(slug);
    }, [slug, isEditMode, navigate, showPopup]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (brandInputRef.current && !brandInputRef.current.contains(e.target)) setShowBrandSuggestions(false);
            if (categoryInputRef.current && !categoryInputRef.current.contains(e.target)) setShowCategorySuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClassificationChange = useCallback((data) => {
        setClassificationData(data);
    }, []);

    const handleSelectCategory = (category) => {
        setCategoryInput(category.name); 
        setSelectedCategoryId(category._id); 
        setShowCategorySuggestions(false); 
        setFormErrors(prev => ({ ...prev, category: null }));
    };
    
    const handleAddNewCategory = async (name) => {
        try { 
            const newCategory = await createCategoryByName(name); 
            setCategories([...categories, newCategory]); 
            handleSelectCategory(newCategory); 
        } catch (err) { 
            showPopup(
                'Lỗi',
                err.message || 'Lỗi khi thêm sản phẩm mới',
                null,
                null,
                4,
                1
            )
        }
    };
    
    const handleSelectBrand = (brand) => {
        setBrandInput(brand.name); 
        setSelectedBrandId(brand._id); 
        setShowBrandSuggestions(false); 
        setFormErrors(prev => ({ ...prev, brand: null }));
    };
    
    const handleAddNewBrand = async (name) => {
        try { 
            const newBrand = await createBrandByName(name); 
            setBrands([...brands, newBrand]); 
            handleSelectBrand(newBrand); 
        } catch (err) { 
            showPopup(
                'Lỗi',
                err.message || 'Lỗi khi thêm nhãn hàng mới',
                null,
                null,
                4,
                1
            )
        }
    };
    
    const handleCoverImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (coverImage.public_id) {
            try {
                await deleteImage(coverImage.public_id);
            } catch (error) {
                console.error("Error deleting old cover image:", error.message);
            }
        }
        
        try {
            const data = await uploadImage(file);
            setCoverImage(data);
            setFormErrors(prev => ({ ...prev, coverImage: null }));
        } catch (error) {
            showPopup(
                'Lỗi',
                error.message || 'Tải ảnh sản phẩm thất bại',
                null,
                null,
                4,
                1
            )
        }
    };
    
    const handleCoverImageRemove = async (e) => {
        e.stopPropagation();
        if (!coverImage.public_id) {
            setCoverImage({ url: null, public_id: null });
            return;
        }

        try {
            await deleteImage(coverImage.public_id);
            setCoverImage({ url: null, public_id: null });
        } catch (error) {
            showPopup(
                'Lỗi',
                error.message || 'Xóa ảnh sản phẩm thất bại',
                null,
                null,
                4,
                1
            )
        }
    };
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

        if (primaryConfig && primaryConfig.name.trim()) {
            if (variants.length === 0) {
                clsError = `Vui lòng thêm ít nhất một lựa chọn cho "${primaryConfig.name}".`;
            } else {
                for (const variant of variants) {
                    if (!variant.name.trim()) {
                        clsError = `Vui lòng nhập tên cho tất cả lựa chọn ở "${primaryConfig.name}".`;
                        break;
                    }
                    if (!variant.images || variant.images.length === 0) {
                        clsError = `Mỗi lựa chọn ở "${primaryConfig.name}" (ví dụ: "${variant.name}") phải có ít nhất một hình ảnh.`;
                        break;
                    }
                }

                if (!clsError && secondaryConfig && secondaryConfig.name.trim()) {
                    if (!variants.every(v => v.options && v.options.length > 0)) {
                        clsError = `Vui lòng thêm ít nhất một lựa chọn cho "${secondaryConfig.name}".`;
                    } else {
                        const seenSkus = new Set(); 
                        for (const variant of variants) {
                            for (const option of variant.options) {
                                if (!option.value.trim()) {
                                    clsError = `Vui lòng nhập tên cho tất cả lựa chọn ở "${secondaryConfig.name}".`;
                                    break;
                                }
                                if (option.price === null || option.price === '' || Number(option.price) <= 0) {
                                    clsError = `Giá của phiên bản "${variant.name} - ${option.value}" phải lớn hơn 0.`;
                                    break;
                                }
                                const stockValue = option.stock_quantity;
                                const stockNumber = Number(stockValue);
                                if (stockValue === null || stockValue === '' || isNaN(stockNumber) || stockNumber < 0) {
                                    clsError = `Kho hàng của phiên bản "${variant.name} - ${option.value}" phải là số không âm và không được để trống.`;
                                    break;
                                }
                                const currentSku = option.sku_code?.trim();
                                if (!currentSku) {
                                    clsError = `SKU của phiên bản "${variant.name} - ${option.value}" không được để trống.`;
                                    break;
                                }

                                if (seenSkus.has(currentSku)) {
                                    clsError = `SKU bị trùng lặp: "${currentSku}". Mỗi phiên bản phải có SKU duy nhất.`;
                                    break;
                                }
                                seenSkus.add(currentSku);
                            }
                            if (clsError) break;
                        }
                    }
                }
            }
        }

        setFormErrors(newErrors);
        setClassificationError(clsError);

        if (Object.keys(newErrors).length > 0) {
            setActiveTab('basic');
            return false;
        }
        if (clsError) {
            setActiveTab('sales');
            return false;
        }
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
                        name: productName, 
                        description, 
                        brand: selectedBrandId, 
                        category_ids: [selectedCategoryId],
                        thumbnail_url: coverImage.url, 
                        classification_config: currentData.config, 
                        variants: currentData.variants,
                    };
                    if (isEditMode) {
                        await editProduct(slug, productPayload);
                        showPopup(
                            'Thông báo',
                            'Cập nhật sản phẩm thành công',
                            null,
                            null,
                            4,
                            1
                        )
                    } else {
                        await addProduct(productPayload);
                        showPopup(
                            'Thông báo',
                            'Tạo sản phẩm thành công',
                            null,
                            null,
                            4,
                            1
                        )
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

    if (isLoading) {
        return <div className="product-loading">Đang tải dữ liệu sản phẩm...</div>;
    }

    return (
        <div className="add-product-container">
            <div className="add-product-tabs">
                <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className={`add-product-tab ${activeTab === "basic" ? "active" : ""}`}
                >
                    Thông tin cơ bản
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("sales")}
                    className={`add-product-tab ${activeTab === "sales" ? "active" : ""}`}
                >
                    Thông tin bán hàng
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="add-product-content">
                    {activeTab === 'basic' && (
                        <>
                            <div className="product-field-group">
                                <label className="product-field-label required">Ảnh bìa</label>
                                <div className="product-field-content">
                                    <div
                                        className={`product-image-upload ${coverImage.url ? 'has-image' : ''}`}
                                        onClick={() => document.getElementById('cover-image-input').click()}
                                    >
                                        {coverImage.url ? (
                                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                                <img
                                                    src={coverImage.url}
                                                    alt="Ảnh bìa"
                                                    className="product-uploaded-image"
                                                />
                                                <button
                                                    type="button"
                                                    className="product-remove-image"
                                                    onClick={handleCoverImageRemove}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="product-upload-placeholder">
                                                <div className="product-upload-placeholder-text">Thêm ảnh</div>
                                            </div>
                                        )}
                                        <input
                                            id="cover-image-input"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleCoverImageUpload}
                                        />
                                    </div>
                                    {formErrors.coverImage && (
                                        <div className="product-error-message">{formErrors.coverImage}</div>
                                    )}
                                </div>
                            </div>
                            <div className="product-field-group">
                                <label className="product-field-label required">Tên sản phẩm</label>
                                <div className="product-field-content">
                                    <input
                                        type="text"
                                        className={`product-input ${formErrors.productName ? 'error' : ''}`}
                                        value={productName}
                                        onChange={(e) => {
                                            setProductName(e.target.value);
                                            if (formErrors.productName) setFormErrors(p => ({ ...p, productName: null }));
                                        }}
                                        placeholder="Nhập tên sản phẩm"
                                        maxLength={CHAR_LIMITS.NAME}
                                    />
                                    <div className="product-char-counter">
                                        {productName.length}/{CHAR_LIMITS.NAME}
                                    </div>
                                    {formErrors.productName && (
                                        <div className="product-error-message">{formErrors.productName}</div>
                                    )}
                                </div>
                            </div>
                            <div className="product-field-group">
                                <label className="product-field-label required">Thương hiệu</label>
                                <div className="product-field-content">
                                    <div className="product-autocomplete" ref={brandInputRef}>
                                        <input
                                            type="text"
                                            className={`product-input ${formErrors.brand ? 'error' : ''}`}
                                            value={brandInput}
                                            onFocus={() => setShowBrandSuggestions(true)}
                                            onChange={(e) => {
                                                setBrandInput(e.target.value);
                                                setShowBrandSuggestions(true);
                                                setSelectedBrandId('');
                                                if (formErrors.brand) setFormErrors(p => ({ ...p, brand: null }));
                                            }}
                                            placeholder="Chọn hoặc thêm thương hiệu"
                                            maxLength={CHAR_LIMITS.BRAND} 
                                        />
                                        {showBrandSuggestions && (
                                            <div className="product-autocomplete-suggestions">
                                                {filteredBrands.map((brand) => (
                                                    <div key={brand._id} className="product-autocomplete-item" onClick={() => handleSelectBrand(brand)}>
                                                        {brand.name}
                                                    </div>
                                                ))}
                                                {filteredBrands.length === 0 && brandInput && (
                                                    <div className="product-autocomplete-item product-autocomplete-add-new" onClick={() => handleAddNewBrand(brandInput)}>
                                                        + Thêm mới: "{brandInput}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-char-counter">
                                        {brandInput.length}/{CHAR_LIMITS.BRAND}
                                    </div>
                                    {formErrors.brand && (
                                        <div className="product-error-message">{formErrors.brand}</div>
                                    )}
                                </div>
                            </div>
                            <div className="product-field-group">
                                <label className="product-field-label required">Ngành hàng</label>
                                <div className="product-field-content">
                                    <div className="product-autocomplete" ref={categoryInputRef}>
                                        <input
                                            type="text"
                                            className={`product-input ${formErrors.category ? 'error' : ''}`}
                                            value={categoryInput}
                                            onFocus={() => setShowCategorySuggestions(true)}
                                            onChange={(e) => {
                                                setCategoryInput(e.target.value);
                                                setShowCategorySuggestions(true);
                                                setSelectedCategoryId('');
                                                if (formErrors.category) setFormErrors(p => ({ ...p, category: null }));
                                            }}
                                            placeholder="Chọn hoặc thêm ngành hàng"
                                            maxLength={CHAR_LIMITS.CATEGORY} 
                                        />
                                        {showCategorySuggestions && (
                                            <div className="product-autocomplete-suggestions">
                                                {filteredCategories.map((cat) => (
                                                    <div key={cat._id} className="product-autocomplete-item" onClick={() => handleSelectCategory(cat)}>
                                                        {cat.name}
                                                    </div>
                                                ))}
                                                {filteredCategories.length === 0 && categoryInput && (
                                                    <div className="product-autocomplete-item product-autocomplete-add-new" onClick={() => handleAddNewCategory(categoryInput)}>
                                                        + Thêm mới: "{categoryInput}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-char-counter">
                                        {categoryInput.length}/{CHAR_LIMITS.CATEGORY}
                                    </div>
                                    {formErrors.category && (
                                        <div className="product-error-message">{formErrors.category}</div>
                                    )}
                                </div>
                            </div>
                            <div className="product-field-group">
                                <label className="product-field-label">Mô tả sản phẩm</label>
                                <div className="product-field-content">
                                    <textarea
                                        className="product-textarea"
                                        rows="5"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập mô tả sản phẩm..."
                                        maxLength={CHAR_LIMITS.DESCRIPTION}
                                    />
                                    <div className="product-char-counter">
                                        {description.length}/{CHAR_LIMITS.DESCRIPTION}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'sales' && (
                        <div className="product-classification-wrapper">
                            <ProductClassification
                                initialClassifications={classifications}
                                initialData={initialClassificationData}
                                onClassificationsChange={setClassifications}
                                onDataChange={handleClassificationChange}
                                error={classificationError}
                            />
                        </div>
                    )}
                </div>
                
                <div className="product-submit-section">
                    {submitError && (
                        <div className="product-submit-error">{submitError}</div>
                    )}
                    <button
                        type="submit"
                        className="product-submit-button"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProducts;