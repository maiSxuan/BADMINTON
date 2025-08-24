"use client";

import React, { useState, useEffect, useRef } from "react";
import "./ProductClassification.css";
import { uploadImage, deleteImage } from "../../services";
import { usePopup } from "../../components/common/popupContext";
const CHAR_LIMITS = {
    CLASSIFICATION_NAME: 50,
    OPTION_VALUE: 100,
    SKU: 50,
};
const uploadImageToServer = async (file) => await uploadImage(file);
const deleteImageFromServer = async (public_id) => await deleteImage(public_id);
const MAX_IMAGES_PER_VARIANT = 5;

const ProductClassification = ({ initialClassifications, initialData, onClassificationsChange, onDataChange, error }) => {
    const [localClassifications, setLocalClassifications] = useState(initialClassifications);
    const [uiVariants, setUiVariants] = useState([]); 
    const [bulkValues, setBulkValues] = useState({ price: "", stock: "", skuPrefix: "" });
    const [uploadingState, setUploadingState] = useState({});
    const isInitialized = useRef(false);

    const {showPopup} = usePopup()
    useEffect(() => {
        if (initialData && initialData.classifications && !isInitialized.current) {
            setLocalClassifications(initialData.classifications);
            isInitialized.current = true; 
        }
    }, [initialData]);

    useEffect(() => {
    setUiVariants(prevUiVariants => {
        const [primaryClassification, secondaryClassification] = localClassifications;
        if (!primaryClassification || !secondaryClassification || !primaryClassification.options || !secondaryClassification.options) return [];

        const selectedPrimary = primaryClassification.options.filter(o => o.selected);
        const selectedSecondary = secondaryClassification.options.filter(o => o.selected);
        if (selectedPrimary.length === 0 || selectedSecondary.length === 0) return [];

        return selectedPrimary.map(primaryOpt => {
            const existingVariant = prevUiVariants.find(v => v.id === primaryOpt.id);
            
            return {
                id: primaryOpt.id,
                name: primaryOpt.name,
                images: primaryOpt.images,
                options: selectedSecondary.map(secondaryOpt => {
                    const existingOption = existingVariant?.options.find(opt => opt.id === secondaryOpt.id);
                    
                    const initialPrimary = initialData?.uiVariants?.find(v => v.id === primaryOpt.id);
                    const initialSecondary = initialPrimary?.options?.find(o => o.id === secondaryOpt.id);

                    return {
                        id: secondaryOpt.id,
                        name: secondaryOpt.name,
                        price: existingOption?.price ?? initialSecondary?.price ?? '',
                        stock: existingOption?.stock ?? initialSecondary?.stock ?? '',
                        sku: existingOption?.sku ?? initialSecondary?.sku ?? '',
                    };
                }),
            };
        });
    });
}, [localClassifications, initialData]);

// Effect 2: Gửi dữ liệu đã định dạng lên component cha
useEffect(() => {
    if (onDataChange) {
        const formattedVariants = uiVariants.map(variant => ({
            name: variant.name, images: (variant.images || []).map(img => img.url),
            options: (variant.options || []).map(option => ({
                value: option.name, price: Number(option.price) || 0, stock_quantity: Number(option.stock) || 0, sku_code: option.sku || ''
            }))
        }));
        const formattedConfig = localClassifications
            .map(c => ({ name: c.name }))
            .filter(c => c.name && c.name.trim() !== '');

        onDataChange({ variants: formattedVariants, config: formattedConfig });
    }
}, [uiVariants, localClassifications, onDataChange]);

    const handleLocalClassificationsChange = (newClassifications) => {
        setLocalClassifications(newClassifications);
        onClassificationsChange(newClassifications);
    };
    const updateClassificationField = (classificationId, field, value) => {
        const newClassifications = localClassifications.map(c =>
            c.id === classificationId ? { ...c, [field]: value } : c
        );
        handleLocalClassificationsChange(newClassifications);
    };

    const updateOptionField = (classificationId, optionId, field, value) => {
        const newClassifications = localClassifications.map(c =>
            c.id === classificationId ? { ...c, options: c.options.map(o => o.id === optionId ? { ...o, [field]: value } : o) } : c
        );
        handleLocalClassificationsChange(newClassifications);
    };

    const handleDataChange = (primaryId, secondaryId, field, value) => {
        const newUiVariants = uiVariants.map(v => 
            v.id === primaryId 
                ? { ...v, options: v.options.map(opt => 
                    opt.id === secondaryId ? { ...opt, [field]: value } : opt
                  )} 
                : v
        );
        setUiVariants(newUiVariants);
    };

    const addOption = (classificationId) => {
    const newOption = {
        id: Date.now(),
        name: "",
        selected: true,
        ...(classificationId === 1 && { images: [] }) 
    };
    const newClassifications = localClassifications.map(c => {
        if (c.id === classificationId) {
            return { ...c, options: [...(c.options || []), newOption] };
        }
        return c;
    });
    handleLocalClassificationsChange(newClassifications);
};

    const removeOption = async (classificationId, optionId) => {
        const optionToRemove = localClassifications.find(c => c.id === classificationId)?.options.find(o => o.id === optionId);
        if (optionToRemove?.images?.length > 0) {
            try { await Promise.all(optionToRemove.images.map(img => deleteImageFromServer(img.public_id))); }
            catch (error) { console.error("Failed to delete images:", error); }
        }
        const newClassifications = localClassifications.map(c =>
            c.id === classificationId ? { ...c, options: c.options.filter(o => o.id !== optionId) } : c
        );
        handleLocalClassificationsChange(newClassifications);
    };
    
    const handleMultiImageUpload = async (optionId, event) => {
        const files = Array.from(event.target.files); if (files.length === 0) return;
        const optionToUpdate = localClassifications[0].options.find(o => o.id === optionId);
        if ((optionToUpdate.images || []).length + files.length > MAX_IMAGES_PER_VARIANT) {
            showPopup(
                'Thông báo',
                `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES_PER_VARIANT} ảnh`,
                null,
                null,
                4,
                3
            )
            return;
        }
        setUploadingState(prev => ({ ...prev, [optionId]: true }));
        try {
            const uploadedImages = await Promise.all(files.map(file => uploadImageToServer(file)));
            const newImages = [...(optionToUpdate.images || []), ...uploadedImages];
            updateOptionField(1, optionId, 'images', newImages); 
        } catch (error) {
            showPopup(
                'Lỗi',
                error.message || 'Lỗi khi tải ảnh',
                null,
                null,
                4,
                3
            )
        } finally {
            setUploadingState(prev => ({ ...prev, [optionId]: false }));
        }
    };
    
    const handleImageRemove = async (optionId, publicIdToRemove) => {
        const optionToUpdate = localClassifications[0].options.find(o => o.id === optionId);
        const imageToRemove = optionToUpdate.images.find(img => img.public_id === publicIdToRemove);
        if (!imageToRemove) return;
        try {
            await deleteImageFromServer(imageToRemove.public_id);
            const newImages = optionToUpdate.images.filter(img => img.public_id !== publicIdToRemove);
            updateOptionField(1, optionId, 'images', newImages); 
        } catch (error) {
            showPopup(
                'Lỗi',
                error.message || 'Lỗi khi xóa ảnh',
                null,
                null,
                4,
                3
            )
        }
    };
    
     const applyBulkValues = () => {
        const newUiVariants = uiVariants.map(variant => ({
            ...variant,
            options: variant.options.map(opt => {
                const skuSuffix = `${variant.name.toUpperCase()}-${opt.name.toUpperCase()}`;
                return {
                    ...opt,
                    price: bulkValues.price || opt.price,
                    stock: bulkValues.stock || opt.stock,
                    sku: bulkValues.skuPrefix ? `${bulkValues.skuPrefix}-${skuSuffix}` : opt.sku
                };
            }),
        }));
        setUiVariants(newUiVariants);
    };

    const hasVariants = uiVariants.length > 0;
    const [primaryClassification, secondaryClassification] = localClassifications;

    return (
        <>
            {localClassifications.map((classification, index) => (
                <div key={classification.id} className="classification-section">
                    <div className="classification-header"><div className="classification-title">Phân loại {index + 1}</div></div>
                    <input type="text" className="classification-name-input" value={classification.name} onChange={(e) => updateClassificationField(classification.id, 'name', e.target.value)} placeholder="Tên phân loại" maxLength={CHAR_LIMITS.CLASSIFICATION_NAME} />
                    <div className="options-header"><div className="options-title">Các lựa chọn</div></div>
                    <div className="options-grid">
                        {(classification.options || []).map((option) => (
                            <div key={option.id} className={`option-item ${option.selected ? "selected" : ""}`}>
                                <div className="option-header">
                                    <input type="checkbox" className="option-checkbox" checked={option.selected} onChange={(e) => updateOptionField(classification.id, option.id, 'selected', e.target.checked)} />
                                    <button type="button" className="remove-option-btn" onClick={() => removeOption(classification.id, option.id)}>×</button>
                                </div>
                                <input type="text" className="option-input" value={option.name} onChange={(e) => updateOptionField(classification.id, option.id, 'name', e.target.value)} placeholder="Tên lựa chọn" maxLength={CHAR_LIMITS.OPTION_VALUE} />
                                {index === 0 && (
                                    <div className="multi-image-uploader">
                                        <div className="image-previews-grid">
                                            {(option.images || []).map(image => (<div key={image.public_id || image.url} className="image-preview-item"> <img src={image.url} alt="preview" /> <button type="button" onClick={() => handleImageRemove(option.id, image.public_id)}>×</button> </div>))}
                                            {(option.images || []).length < MAX_IMAGES_PER_VARIANT && (<label htmlFor={`multi-image-input-${option.id}`} className="upload-new-image-btn"> {uploadingState[option.id] ? "..." : "+"} </label>)}
                                        </div>
                                        <input id={`multi-image-input-${option.id}`} type="file" accept="image/*" multiple hidden onChange={(e) => handleMultiImageUpload(option.id, e)} />
                                    </div>
                                )}
                            </div>
                        ))}
                        <button type="button" className="add-option-btn-grid" onClick={() => addOption(classification.id)}>+ Thêm lựa chọn</button>
                    </div>
                </div>
            ))}
            <div className="price-inventory-section">
                <div className="price-inventory-title">Thiết lập giá và tồn kho</div>
                {error && <div className="classification-error-message">{error}</div>}
                {hasVariants && (
                    <div className="bulk-input-section">
                         <div className="bulk-input-header"> <div className="bulk-input-title">Nhập giá trị chung</div> <button type="button" className="bulk-apply-btn" onClick={applyBulkValues}>Áp dụng</button> </div>
                        <div className="bulk-input-grid">
                            <input
                                type="number"
                                className="bulk-input"
                                value={bulkValues.price}
                                onChange={(e) => setBulkValues({ ...bulkValues, price: e.target.value })}
                                placeholder="Giá"
                            />
                            <input
                                type="number"
                                className="bulk-input"
                                value={bulkValues.stock}
                                onChange={(e) => setBulkValues({ ...bulkValues, stock: e.target.value })}
                                placeholder="Kho"
                            />
                            <input
                                type="text"
                                className="bulk-input"
                                value={bulkValues.skuPrefix}
                                onChange={(e) => setBulkValues({ ...bulkValues, skuPrefix: e.target.value })}
                                placeholder="Tiền tố SKU"
                                maxLength={CHAR_LIMITS.SKU}
                            />
                        </div>
                    </div>
                )}
                {hasVariants && primaryClassification?.name && secondaryClassification?.name ? (
                    <div className="price-inventory-grid">
                        <div className="table-header-cell">{primaryClassification.name}</div>
                        <div className="table-header-cell">{secondaryClassification.name}</div>
                        <div className="table-header-cell">*Giá</div>
                        <div className="table-header-cell">*Kho hàng</div>
                        <div className="table-header-cell">*SKU phân loại</div>
                        <div className="table-container">
                            {uiVariants.map(primaryVariant =>
                                (primaryVariant.options || []).map((secondaryVariant, secondaryIndex) => (
                                    <React.Fragment key={`${primaryVariant.id}-${secondaryVariant.id}`}>
                                        {secondaryIndex === 0 && (<div className="table-cell parent-cell" style={{ gridRow: `span ${primaryVariant.options.length || 1}` }}> <div className="variant-info"> <img src={primaryVariant.images?.[0]?.url} alt={primaryVariant.name} className="variant-image" /> <span className="variant-name">{primaryVariant.name}</span> </div> </div>)}
                                        <div className="table-cell"><span className="variant-name">{secondaryVariant.name}</span></div>
                                        <div className="table-cell"><input type="number" className="table-input" value={secondaryVariant.price} onChange={e => handleDataChange(primaryVariant.id, secondaryVariant.id, 'price', e.target.value)} placeholder="Nhập vào" /></div>
<div className="table-cell"><input type="number" className="table-input" value={secondaryVariant.stock} onChange={e => handleDataChange(primaryVariant.id, secondaryVariant.id, 'stock', e.target.value)} placeholder="0" /></div>
<div className="table-cell"><input type="text" className="table-input" value={secondaryVariant.sku} onChange={e => handleDataChange(primaryVariant.id, secondaryVariant.id, 'sku', e.target.value)} placeholder="Nhập vào" maxLength={CHAR_LIMITS.SKU} /></div>
                                    </React.Fragment>   
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    hasVariants && primaryClassification?.name && <div className="no-variants-message">Vui lòng thiết lập Phân loại 2 để tạo bảng giá.</div>
                )}
                {!hasVariants && !error && (
                    <div className="no-variants-message">Vui lòng chọn các lựa chọn để tạo bảng giá.</div>
                )}
            </div>
        </>
    );
};
export default ProductClassification;