"use client";

import React, { useState, useEffect } from "react";
import "./ProductClassification.css";
import { uploadImage, deleteImage } from "../../services";

// Helper functions (không đổi)
const uploadImageToServer = async (file) => await uploadImage(file);
const deleteImageFromServer = async (public_id) => await deleteImage(public_id);
const MAX_IMAGES_PER_VARIANT = 5;

// Component chính
const ProductClassification = ({ initialClassifications, initialData, onClassificationsChange, onDataChange, error }) => {
    // --- STATE NỘI BỘ ---
    // localClassifications là "nguồn chân lý" duy nhất cho tất cả dữ liệu
    const [localClassifications, setLocalClassifications] = useState(initialClassifications);
    const [uiVariants, setUiVariants] = useState([]); // Chỉ dùng để render bảng
    const [bulkValues, setBulkValues] = useState({ price: "", stock: "", skuPrefix: "" });
    const [uploadingState, setUploadingState] = useState({});

    // Effect 1: Đồng bộ props từ cha vào state nội bộ.
    useEffect(() => {
        // Chỉ cập nhật từ initialData một lần duy nhất để điền form
        // Hoặc khi initialClassifications thay đổi (ví dụ: chuyển từ edit sản phẩm này sang sản phẩm khác)
        if (initialData && initialData.classifications) {
            setLocalClassifications(initialData.classifications);
        } else {
            setLocalClassifications(initialClassifications);
        }
    }, [initialClassifications, initialData]);

    // Effect 2: Đồng bộ "nguồn chân lý" (localClassifications) ra UI và gửi lên cha
    useEffect(() => {
        const [primaryClassification, secondaryClassification] = localClassifications;
        let newUiVariants = [];

        // Step 1: Xây dựng cấu trúc bảng (newUiVariants) dựa trên các lựa chọn đang được `selected`
        if (primaryClassification?.options && secondaryClassification?.options) {
            const selectedPrimary = primaryClassification.options.filter(o => o.selected);
            const selectedSecondary = secondaryClassification.options.filter(o => o.selected);

            if (selectedPrimary.length > 0) {
                newUiVariants = selectedPrimary.map(primaryOpt => ({
                    id: primaryOpt.id,
                    name: primaryOpt.name,
                    images: primaryOpt.images, // Luôn lấy ảnh từ nguồn chân lý
                    options: selectedSecondary.map(secondaryOpt => ({
                        id: secondaryOpt.id,
                        name: secondaryOpt.name,
                        // Luôn lấy giá/kho/sku từ nguồn chân lý
                        price: primaryOpt.options?.find(o => o.id === secondaryOpt.id)?.price ?? '',
                        stock: primaryOpt.options?.find(o => o.id === secondaryOpt.id)?.stock ?? '',
                        sku: primaryOpt.options?.find(o => o.id === secondaryOpt.id)?.sku ?? '',
                    })),
                }));
            }
        }
        
        setUiVariants(newUiVariants);

        // Step 2: Gửi dữ liệu đã định dạng lên cha
        if (onDataChange) {
            const formattedVariants = localClassifications[0]?.options
                .filter(o => o.selected)
                .map(pOpt => ({
                    name: pOpt.name,
                    images: (pOpt.images || []).map(img => img.url),
                    options: localClassifications[1]?.options
                        .filter(sOpt => sOpt.selected)
                        .map(sOpt => {
                            const data = pOpt.options?.find(d => d.id === sOpt.id) || {};
                            return {
                                value: sOpt.name,
                                price: Number(data.price) || 0,
                                stock_quantity: Number(data.stock) || 0,
                                sku_code: data.sku || ''
                            };
                        })
                })) || [];
                
            const formattedConfig = localClassifications
                .map(c => ({ name: c.name }))
                .filter(c => c.name && c.name.trim() !== '');

            onDataChange({ variants: formattedVariants, config: formattedConfig });
        }
    }, [localClassifications, onDataChange, onClassificationsChange]); // Chạy lại mỗi khi nguồn chân lý thay đổi

    // --- CÁC HÀM HANDLER ĐÃ ĐƯỢC CẤU TRÚC LẠI ---

    const handleLocalClassificationsChange = (newClassifications) => {
        setLocalClassifications(newClassifications);
        // Đồng thời báo cho cha biết cấu trúc phân loại đã thay đổi (tên, số lựa chọn)
        onClassificationsChange(newClassifications);
    };

    // Tất cả các hàm `update` giờ sẽ thao tác trực tiếp trên `localClassifications`
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

    const updateNestedOptionField = (primaryOptId, secondaryOptId, field, value) => {
        const newClassifications = [...localClassifications];
        const primaryClsIndex = 0;
        const primaryOptIndex = newClassifications[primaryClsIndex].options.findIndex(o => o.id === primaryOptId);

        if (primaryOptIndex > -1) {
            // Đảm bảo mảng options lồng nhau tồn tại
            if (!newClassifications[primaryClsIndex].options[primaryOptIndex].options) {
                newClassifications[primaryClsIndex].options[primaryOptIndex].options = [];
            }
            
            let secondaryOptIndex = newClassifications[primaryClsIndex].options[primaryOptIndex].options.findIndex(o => o.id === secondaryOptId);

            if (secondaryOptIndex > -1) {
                // Cập nhật option đã tồn tại
                newClassifications[primaryClsIndex].options[primaryOptIndex].options[secondaryOptIndex][field] = value;
            } else {
                // Thêm option mới nếu chưa có
                newClassifications[primaryClsIndex].options[primaryOptIndex].options.push({
                    id: secondaryOptId,
                    [field]: value
                });
            }
        }
        handleLocalClassificationsChange(newClassifications);
    };

    const addOption = (classificationId) => {
        const newOption = {
            id: Date.now(),
            name: "",
            selected: true,
            ...(classificationId === 1 && { images: [], options: [] }) // Thêm mảng options rỗng
        };
        const newClassifications = localClassifications.map(c =>
            c.id === classificationId ? { ...c, options: [...(c.options || []), newOption] } : c
        );
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
            alert(`Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES_PER_VARIANT} ảnh.`); return;
        }
        setUploadingState(prev => ({ ...prev, [optionId]: true }));
        try {
            const uploadedImages = await Promise.all(files.map(file => uploadImageToServer(file)));
            const newImages = [...(optionToUpdate.images || []), ...uploadedImages];
            updateOptionField(1, optionId, 'images', newImages); // Cập nhật trực tiếp
        } catch (error) {
            alert("Lỗi khi tải lên: " + error.message);
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
            updateOptionField(1, optionId, 'images', newImages); // Cập nhật trực tiếp
        } catch (error) {
            alert("Lỗi khi xóa ảnh: " + error.message);
        }
    };
    
    const applyBulkValues = () => {
        let newClassifications = [...localClassifications];
        newClassifications[0].options.forEach(pOpt => {
            if (pOpt.selected) {
                newClassifications[1].options.forEach(sOpt => {
                    if (sOpt.selected) {
                        const skuSuffix = `${pOpt.name.toUpperCase()}-${sOpt.name.toUpperCase()}`;
                        if (bulkValues.price) updateNestedOptionField(pOpt.id, sOpt.id, 'price', bulkValues.price);
                        if (bulkValues.stock) updateNestedOptionField(pOpt.id, sOpt.id, 'stock', bulkValues.stock);
                        if (bulkValues.skuPrefix) updateNestedOptionField(pOpt.id, sOpt.id, 'sku', `${bulkValues.skuPrefix}-${skuSuffix}`);
                    }
                });
            }
        });
        // Không cần gọi setLocalClassifications ở đây vì updateNestedOptionField đã gọi rồi
    };

    const hasVariants = uiVariants.length > 0;
    const [primaryClassification, secondaryClassification] = localClassifications;

    return (
        <>
            {localClassifications.map((classification, index) => (
                <div key={classification.id} className="classification-section">
                    <div className="classification-header"><div className="classification-title">Phân loại {index + 1}</div></div>
                    <input type="text" className="classification-name-input" value={classification.name} onChange={(e) => updateClassificationField(classification.id, 'name', e.target.value)} placeholder="Tên phân loại" />
                    <div className="options-header"><div className="options-title">Các lựa chọn</div></div>
                    <div className="options-grid">
                        {(classification.options || []).map((option) => (
                            <div key={option.id} className={`option-item ${option.selected ? "selected" : ""}`}>
                                <div className="option-header">
                                    <input type="checkbox" className="option-checkbox" checked={option.selected} onChange={(e) => updateOptionField(classification.id, option.id, 'selected', e.target.checked)} />
                                    <button type="button" className="remove-option-btn" onClick={() => removeOption(classification.id, option.id)}>×</button>
                                </div>
                                <input type="text" className="option-input" value={option.name} onChange={(e) => updateOptionField(classification.id, option.id, 'name', e.target.value)} placeholder="Tên lựa chọn" />
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
                        <div className="bulk-input-grid"> <input type="number" className="bulk-input" value={bulkValues.price} onChange={(e) => setBulkValues({ ...bulkValues, price: e.target.value })} placeholder="Giá" /> <input type="number" className="bulk-input" value={bulkValues.stock} onChange={(e) => setBulkValues({ ...bulkValues, stock: e.target.value })} placeholder="Kho" /> <input type="text" className="bulk-input" value={bulkValues.skuPrefix} onChange={(e) => setBulkValues({ ...bulkValues, skuPrefix: e.target.value })} placeholder="Tiền tố SKU" /> </div>
                    </div>
                )}
                {hasVariants && primaryClassification?.name && secondaryClassification?.name ? (
                    <div className="price-inventory-grid">
                        <div className="table-header-cell">{primaryClassification.name}</div>
                        <div className="table-header-cell">{secondaryClassification.name}</div>
                        <div className="table-header-cell">*Giá</div>
                        <div className="table-header-cell">*Kho hàng</div>
                        <div className="table-header-cell">SKU phân loại</div>
                        <div className="table-container">
                            {uiVariants.map(primaryVariant =>
                                (primaryVariant.options || []).map((secondaryVariant, secondaryIndex) => (
                                    <React.Fragment key={`${primaryVariant.id}-${secondaryVariant.id}`}>
                                        {secondaryIndex === 0 && (<div className="table-cell parent-cell" style={{ gridRow: `span ${primaryVariant.options.length || 1}` }}> <div className="variant-info"> <img src={primaryVariant.images?.[0]?.url} alt={primaryVariant.name} className="variant-image" /> <span className="variant-name">{primaryVariant.name}</span> </div> </div>)}
                                        <div className="table-cell"><span className="variant-name">{secondaryVariant.name}</span></div>
                                        <div className="table-cell"><input type="number" className="table-input" value={secondaryVariant.price} onChange={e => updateNestedOptionField(primaryVariant.id, secondaryVariant.id, 'price', e.target.value)} placeholder="Nhập vào" /></div>
                                        <div className="table-cell"><input type="number" className="table-input" value={secondaryVariant.stock} onChange={e => updateNestedOptionField(primaryVariant.id, secondaryVariant.id, 'stock', e.target.value)} placeholder="0" /></div>
                                        <div className="table-cell"><input type="text" className="table-input" value={secondaryVariant.sku} onChange={e => updateNestedOptionField(primaryVariant.id, secondaryVariant.id, 'sku', e.target.value)} placeholder="Nhập vào" /></div>
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