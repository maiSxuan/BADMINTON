// src/pages/admin/products/ProductClassification.jsx

"use client";

import React, { useState, useEffect } from "react";
import "./ProductClassification.css";
import { uploadImage, deleteImage } from "../../services";

// Helper functions (không đổi)
const uploadImageToServer = async (file) => await uploadImage(file);
const deleteImageFromServer = async (public_id) => await deleteImage(public_id);
const MAX_IMAGES_PER_VARIANT = 5;

// Component chính
const ProductClassification = ({ initialClassifications, initialData, onClassificationsChange, onDataChange }) => {
    // --- STATE NỘI BỘ ---
    const [localClassifications, setLocalClassifications] = useState(initialClassifications);
    const [uiVariants, setUiVariants] = useState([]);
    const [bulkValues, setBulkValues] = useState({ price: "", stock: "", skuPrefix: "" });
    const [uploadingState, setUploadingState] = useState({});

    // Effect 1: Đồng bộ props cấu trúc từ cha vào state nội bộ.
    // Điều này cho phép component tự quản lý state nhưng vẫn nhận cập nhật từ cha.
    useEffect(() => {
        setLocalClassifications(initialClassifications);
    }, [initialClassifications]);

    // Effect 2: Logic cốt lõi đã được sửa.
    // Nó kết hợp cả việc nạp dữ liệu ban đầu và dynamic update.
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
                        
                        // Tìm dữ liệu ban đầu tương ứng từ prop `initialData`
                        const initialPrimary = initialData?.uiVariants?.find(v => v.name === primaryOpt.name);
                        const initialSecondary = initialPrimary?.options?.find(o => o.name === secondaryOpt.name);

                        return {
                            id: secondaryOpt.id,
                            name: secondaryOpt.name,
                            // Ưu tiên 1: Dữ liệu người dùng vừa nhập (nếu có).
                            // Ưu tiên 2: Dữ liệu ban đầu từ API (nếu có).
                            // Ưu tiên 3: Giá trị rỗng.
                            price: existingOption?.price || initialSecondary?.price || '',
                            stock: existingOption?.stock || initialSecondary?.stock || '',
                            sku: existingOption?.sku || initialSecondary?.sku || '',
                        };
                    }),
                };
            });
        });
        setBulkValues({ price: "", stock: "", skuPrefix: "" });
    }, [localClassifications, initialData]); // Chạy lại khi cấu trúc hoặc dữ liệu ban đầu thay đổi

    // Effect 3: Gửi dữ liệu đã định dạng lên component cha.
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

    // --- CÁC HÀM HANDLER (Không thay đổi so với phiên bản trước) ---
    const handleLocalClassificationsChange = (newClassifications) => {
        setLocalClassifications(newClassifications);
        onClassificationsChange(newClassifications);
    };
    const handleUiVariantsChange = (newUiVariants) => { setUiVariants(newUiVariants); };
    const updateOption = (classificationId, optionId, fieldsToUpdate) => {
        const newClassifications = localClassifications.map(c => c.id === classificationId ? { ...c, options: c.options.map(o => o.id === optionId ? { ...o, ...fieldsToUpdate } : o) } : c);
        handleLocalClassificationsChange(newClassifications);
    };
    const updateOptionImages = (classificationId, optionId, newImagesArray) => {
        const newClassifications = localClassifications.map(c => c.id === classificationId ? { ...c, options: c.options.map(o => o.id === optionId ? { ...o, images: newImagesArray } : o) } : c);
        handleLocalClassificationsChange(newClassifications);
    };
    const addOption = (classificationId) => {
        const newClassifications = localClassifications.map(c => {
            if (c.id === classificationId) { const newOption = { id: Date.now(), name: "", selected: true, ...(c.id === 1 && { images: [] }) }; return { ...c, options: [...(c.options || []), newOption] }; }
            return c;
        });
        handleLocalClassificationsChange(newClassifications);
    };
    const removeOption = async (classificationId, optionId) => {
        const optionToRemove = localClassifications.find(c => c.id === classificationId)?.options.find(o => o.id === optionId);
        if (optionToRemove?.images?.length > 0) { try { await Promise.all(optionToRemove.images.map(img => deleteImageFromServer(img.public_id))); } catch (error) { console.error("Failed to delete images:", error); } }
        const newClassifications = localClassifications.map(c => c.id === classificationId ? { ...c, options: c.options.filter(o => o.id !== optionId) } : c);
        handleLocalClassificationsChange(newClassifications);
    };
    const updateClassificationName = (id, name) => {
        const newClassifications = localClassifications.map(c => c.id === id ? { ...c, name } : c);
        handleLocalClassificationsChange(newClassifications);
    };
    const handleDataChange = (primaryId, secondaryId, field, value) => {
        const newUiVariants = uiVariants.map(v => v.id === primaryId ? { ...v, options: v.options.map(opt => opt.id === secondaryId ? { ...opt, [field]: value } : opt) } : v);
        handleUiVariantsChange(newUiVariants);
    };
    const handleMultiImageUpload = async (classificationId, optionId, event) => {
        const files = Array.from(event.target.files); if (files.length === 0) return; const optionToUpdate = localClassifications[0].options.find(o => o.id === optionId); if ((optionToUpdate.images || []).length + files.length > MAX_IMAGES_PER_VARIANT) { alert(`Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES_PER_VARIANT} ảnh.`); return; }
        setUploadingState(prev => ({ ...prev, [optionId]: true }));
        try { const uploadedImages = await Promise.all(files.map(file => uploadImageToServer(file))); const newImages = [...(optionToUpdate.images || []), ...uploadedImages]; updateOptionImages(classificationId, optionId, newImages); } catch (error) { alert("Lỗi khi tải lên: " + error.message); } finally { setUploadingState(prev => ({ ...prev, [optionId]: false })); }
    };
    const handleImageRemove = async (classificationId, optionId, publicIdToRemove) => {
        const optionToUpdate = localClassifications[0].options.find(o => o.id === optionId); const imageToRemove = optionToUpdate.images.find(img => img.public_id === publicIdToRemove); if (!imageToRemove) return;
        try { await deleteImageFromServer(imageToRemove.public_id); const newImages = optionToUpdate.images.filter(img => img.public_id !== publicIdToRemove); updateOptionImages(classificationId, optionId, newImages); } catch (error) { alert("Lỗi khi xóa ảnh: " + error.message); }
    };
    const applyBulkValues = () => {
        const newUiVariants = uiVariants.map(variant => ({ ...variant, options: variant.options.map(opt => { const skuSuffix = `${variant.name.toUpperCase()}-${opt.name.toUpperCase()}`; return { ...opt, price: bulkValues.price || opt.price, stock: bulkValues.stock || opt.stock, sku: bulkValues.skuPrefix ? `${bulkValues.skuPrefix}-${skuSuffix}` : opt.sku }; }), }));
        handleUiVariantsChange(newUiVariants);
    };

    const hasVariants = uiVariants.length > 0;
    const [primaryClassification, secondaryClassification] = localClassifications;

    return (
        <>
            {/* JSX không có thay đổi logic, chỉ render state */}
            {localClassifications.map((classification, index) => (
                <div key={classification.id} className="classification-section">
                    <div className="classification-header"><div className="classification-title">Phân loại {index + 1}</div></div>
                    <input type="text" className="classification-name-input" value={classification.name} onChange={(e) => updateClassificationName(classification.id, e.target.value)} placeholder="Tên phân loại" />
                    <div className="options-header"><div className="options-title">Các lựa chọn</div></div>
                    <div className="options-grid">
                        {(classification.options || []).map((option) => (
                            <div key={option.id} className={`option-item ${option.selected ? "selected" : ""}`}>
                                <div className="option-header"> <input type="checkbox" className="option-checkbox" checked={option.selected} onChange={(e) => updateOption(classification.id, option.id, { selected: e.target.checked })} /> <button type="button" className="remove-option-btn" onClick={() => removeOption(classification.id, option.id)}>×</button> </div>
                                <input type="text" className="option-input" value={option.name} onChange={(e) => updateOption(classification.id, option.id, { name: e.target.value })} placeholder="Tên lựa chọn" />
                                {index === 0 && (
                                    <div className="multi-image-uploader">
                                        <div className="image-previews-grid">
                                            {(option.images || []).map(image => (<div key={image.public_id || image.url} className="image-preview-item"> <img src={image.url} alt="preview" /> <button type="button" onClick={() => handleImageRemove(classification.id, option.id, image.public_id)}>×</button> </div>))}
                                            {(option.images || []).length < MAX_IMAGES_PER_VARIANT && (<label htmlFor={`multi-image-input-${option.id}`} className="upload-new-image-btn"> {uploadingState[option.id] ? "..." : "+"} </label>)}
                                        </div>
                                        <input id={`multi-image-input-${option.id}`} type="file" accept="image/*" multiple hidden onChange={(e) => handleMultiImageUpload(classification.id, option.id, e)} />
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
                {hasVariants && (
                    <div className="bulk-input-section">
                        <div className="bulk-input-header"> <div className="bulk-input-title">Nhập giá trị chung</div> <button type="button" className="bulk-apply-btn" onClick={applyBulkValues}>Áp dụng</button> </div>
                        <div className="bulk-input-grid"> <input type="number" className="bulk-input" value={bulkValues.price} onChange={(e) => setBulkValues({ ...bulkValues, price: e.target.value })} placeholder="Giá" /> <input type="number" className="bulk-input" value={bulkValues.stock} onChange={(e) => setBulkValues({ ...bulkValues, stock: e.target.value })} placeholder="Kho" /> <input type="text" className="bulk-input" value={bulkValues.skuPrefix} onChange={(e) => setBulkValues({ ...bulkValues, skuPrefix: e.target.value })} placeholder="Tiền tố SKU" /> </div>
                    </div>
                )}
                {hasVariants && primaryClassification && secondaryClassification ? (
                    <div className="price-inventory-grid">
                        <div className="table-header-cell">{primaryClassification.name || 'Phân loại 1'}</div> <div className="table-header-cell">{secondaryClassification.name || 'Phân loại 2'}</div> <div className="table-header-cell">*Giá</div> <div className="table-header-cell">*Kho hàng</div> <div className="table-header-cell">SKU phân loại</div>
                        <div className="table-container">
                            {uiVariants.map(primaryVariant => (
                                (primaryVariant.options || []).map((secondaryVariant, secondaryIndex) => (
                                    <React.Fragment key={`${primaryVariant.id}-${secondaryVariant.id}`}>
                                        {secondaryIndex === 0 && (<div className="table-cell parent-cell" style={{ gridRow: `span ${primaryVariant.options.length || 1}` }}> <div className="variant-info"> <img src={primaryVariant.images?.[0]?.url} alt={primaryVariant.name} className="variant-image" /> <span className="variant-name">{primaryVariant.name}</span> </div> </div>)}
                                        <div className="table-cell"><span className="variant-name">{secondaryVariant.name}</span></div>
                                        <div className="table-cell"><input type="number" className="table-input" value={secondaryVariant.price} onChange={e => handleDataChange(primaryVariant.id, secondaryVariant.id, 'price', e.target.value)} placeholder="Nhập vào" /></div>
                                        <div className="table-cell"><input type="number" className="table-input" value={secondaryVariant.stock} onChange={e => handleDataChange(primaryVariant.id, secondaryVariant.id, 'stock', e.target.value)} placeholder="0" /></div>
                                        <div className="table-cell"><input type="text" className="table-input" value={secondaryVariant.sku} onChange={e => handleDataChange(primaryVariant.id, secondaryVariant.id, 'sku', e.target.value)} placeholder="Nhập vào" /></div>
                                    </React.Fragment>
                                ))
                            ))}
                        </div>
                    </div>
                ) : (<div className="no-variants-message">Vui lòng chọn các lựa chọn để tạo bảng giá.</div>)}
            </div>
        </>
    );
};
export default ProductClassification;