import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductClassification from "./ProductClassification";
import './AddProducts.css';
import { getAllBrands, getAllCategories,createBrandByName,createCategoryByName,uploadImage,deleteImage,addProduct } from '../../services';

const AddProducts = () => {
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
    const [classificationData, setClassificationData] = useState({ variants: [], config: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const brandInputRef = useRef();
    const categoryInputRef = useRef();

    const [classifications, setClassifications] = useState(() => [
        { id: 1, name: "", options: [{ id: Date.now() + 1, name: "", images: [], price: '', stock: '', sku: '', selected: true }] },
        { id: 2, name: "", options: [{ id: Date.now() + 2, name: "", price: '', stock: '', sku: '', selected: true }] },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    getAllCategories(),
                    getAllBrands()
                ]);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredCategories(
            categories.filter(cat => cat.name.toLowerCase().includes(categoryInput.toLowerCase()))
        );
    }, [categoryInput, categories]);

    useEffect(() => {
        setFilteredBrands(
            brands.filter(brand => brand.name.toLowerCase().includes(brandInput.toLowerCase()))
        );
    }, [brandInput, brands]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (brandInputRef.current && !brandInputRef.current.contains(e.target)) {
                setShowBrandSuggestions(false);
            }
            if (categoryInputRef.current && !categoryInputRef.current.contains(e.target)) {
                setShowCategorySuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectCategory = (category) => {
        setCategoryInput(category.name);
        setSelectedCategoryId(category._id);
        setShowCategorySuggestions(false);
    };

    const handleAddNewCategory = async (name) => {
        try {
            const newCategory = await createCategoryByName(name)
            setCategories([...categories, newCategory]);
            handleSelectCategory(newCategory);
        } catch (err) {
            alert("Không thể thêm ngành hàng mới");
        }
    };

    const handleSelectBrand = (brand) => {
        setBrandInput(brand.name);
        setSelectedBrandId(brand._id);
        setShowBrandSuggestions(false);
    };

    const handleAddNewBrand = async (name) => {
        try {
            const newBrand = await createBrandByName(name)
            setBrands([...brands, newBrand]);
            handleSelectBrand(newBrand);
        } catch (err) {
            alert("Không thể thêm thương hiệu mới");
        }
    };

    const handleClassificationChange = useCallback((data) => {
        setClassificationData(data);
    }, []);

    const handleCoverImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (coverImage.public_id) {
            try {
                await deleteImage(coverImage.public_id);
            } catch (error) {
                console.error("Lỗi khi xóa ảnh bìa cũ:", error.message);
            }
        }
        
        try {
            const data = await uploadImage(file);
            setCoverImage(data);
        } catch (error) {
            alert(error.message);
        }
    };
    const handleCoverImageRemove = async (e) => {
        if (e) e.stopPropagation();
        if (!coverImage.public_id) {
            setCoverImage({ url: null, public_id: null });
            return;
        }
        try {
            await deleteImage(coverImage.public_id);
            setCoverImage({ url: null, public_id: null });
        } catch (error) {
            alert("Lỗi khi xóa ảnh: " + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName || !selectedBrandId || !selectedCategoryId) {
            alert("Vui lòng điền đầy đủ Tên sản phẩm, Thương hiệu và Ngành hàng.");
            return;
        }
        if (!coverImage.url) {
            alert('Bạn cần tải lên ảnh đại diện (thumbnail) cho sản phẩm.');
            return;
        }
        if (!Array.isArray(classifications) || classifications.length === 0) {
            alert('Bạn cần thêm ít nhất một phân loại sản phẩm.');
            return;
        }

        const hasEmptyOptions = classifications.some(
            (c) => !Array.isArray(c.options) || c.options.length === 0
        );
        if (hasEmptyOptions) {
        alert('Mỗi phân loại phải có ít nhất một tuỳ chọn.');
        return;
        }
    
        const filledConfig = classificationData.config.filter(c => c.name && c.name.trim() !== '');
        const filledVariants = classificationData.variants.filter(v => v.name && v.name.trim() !== '');

        if (filledConfig.length > 0) {
            if (filledConfig.length !== classificationData.config.length || filledConfig.length < 2) {
                alert("Vui lòng đặt tên cho tất cả các nhóm phân loại đã tạo.");
                return;
            }
            if (filledVariants.length === 0 || filledVariants.some(v => v.options.length === 0 || v.options.some(opt => !opt.name || opt.name.trim() === ''))) {
                alert("Bạn đã đặt tên cho nhóm phân loại, vui lòng điền đầy đủ tên cho các lựa chọn.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const formattedVariants = filledVariants.map(primaryVariant => ({
                name: primaryVariant.name,
                images: primaryVariant.images ? primaryVariant.images.map(img => img.url) : [],
                options: primaryVariant.options.map(secondaryOption => ({
                    value: secondaryOption.name,
                    sku_code: secondaryOption.sku || `${productName.substring(0,3).toUpperCase()}-${primaryVariant.name.substring(0,3).toUpperCase()}-${secondaryOption.name}`,
                    price: Number(secondaryOption.price) || 0,
                    stock_quantity: Number(secondaryOption.stock) || 0,
                }))
            }));
            if (formattedVariants.length === 0) {
                alert('Bạn cần định nghĩa ít nhất một phân loại hợp lệ (có tên và tùy chọn).');
                setIsSubmitting(false);
            return;
        }
            const productPayload = {
                name: productName,
                description,
                brand: selectedBrandId,
                category_ids: [selectedCategoryId],
                classification_config: filledConfig,
                thumbnail_url: coverImage.url || '',
                variants: formattedVariants,
            };

            const newProduct = await addProduct(productPayload)
            alert(`Tạo sản phẩm thành công: ${newProduct.name}`);
        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="tab-wrapper">
                <div className="tab-container">
                    <button type="button" onClick={() => setActiveTab("basic")} className={`tab-button ${activeTab === "basic" ? "active" : ""}`}>Thông tin cơ bản</button>
                    <button type="button" onClick={() => setActiveTab("sales")} className={`tab-button ${activeTab === "sales" ? "active" : ""}`}>Thông tin bán hàng</button>
                </div>
            </div>

            {activeTab === "basic" && (
                <>
                    <div className="form-row">
                        <label className="form-label">Ảnh bìa</label>
                        <div className="form-control">
                            <div className="cover-image-uploader" onClick={() => document.getElementById('cover-image-input').click()}>
                                {coverImage.url ? (
                                    <div className="image-preview-container">
                                        <img src={coverImage.url} alt="Ảnh bìa" className="uploaded-image" />
                                        <button type="button" className="remove-image-btn" onClick={handleCoverImageRemove}>×</button>
                                    </div>
                                ) : (
                                    <div className="image-upload-placeholder">
                                        <span>Thêm ảnh</span>
                                    </div>
                                )}
                                <input id="cover-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverImageUpload} />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <label className="form-label">Tên sản phẩm</label>
                        <div className="form-control">
                            <input type="text" className="form-input" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <label className="form-label">Thương hiệu</label>
                        <div className="form-control autocomplete-wrapper" ref={brandInputRef}>
                            <input type="text" className="form-input" value={brandInput} onChange={(e) => { setBrandInput(e.target.value); setShowBrandSuggestions(true); }} onFocus={() => setShowBrandSuggestions(true)} />
                            {showBrandSuggestions && (
                                <ul className="autocomplete-suggestions">
                                    {filteredBrands.map((brand) => (
                                        <li key={brand._id} onClick={() => handleSelectBrand(brand)}>{brand.name}</li>
                                    ))}
                                    {filteredBrands.length === 0 && brandInput && (
                                        <li className="add-new" onClick={() => handleAddNewBrand(brandInput)}>+ Thêm mới: "{brandInput}"</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <label className="form-label">Ngành hàng</label>
                        <div className="form-control autocomplete-wrapper" ref={categoryInputRef}>
                            <input type="text" className="form-input" value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setShowCategorySuggestions(true); }} onFocus={() => setShowCategorySuggestions(true)} />
                            {showCategorySuggestions && (
                                <ul className="autocomplete-suggestions">
                                    {filteredCategories.map((cat) => (
                                        <li key={cat._id} onClick={() => handleSelectCategory(cat)}>{cat.name}</li>
                                    ))}
                                    {filteredCategories.length === 0 && categoryInput && (
                                        <li className="add-new" onClick={() => handleAddNewCategory(categoryInput)}>+ Thêm mới: "{categoryInput}"</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <label className="form-label">Mô tả sản phẩm</label>
                        <div className="form-control">
                            <textarea className="form-textarea" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "sales" && (
                <div className="sales-tab-wrapper">
                    <ProductClassification
                        classifications={classifications}
                        onClassificationsChange={setClassifications}
                        onDataChange={handleClassificationChange}
                    />
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
