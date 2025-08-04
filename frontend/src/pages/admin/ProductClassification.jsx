"use client";

import React, { useState, useEffect } from "react";
import "./ProductClassification.css";
import { uploadImage,deleteImage } from "../../services";

const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return await uploadImage(file)
};

const deleteImageFromServer = async (public_id) => {
    await deleteImage(public_id)
};

const MAX_IMAGES_PER_VARIANT = 5;

const ProductClassification = ({ classifications, onClassificationsChange, onDataChange }) => {
  const [uiVariants, setUiVariants] = useState([]);
  const [bulkValues, setBulkValues] = useState({ price: "", stock: "", skuPrefix: "" });
  const [uploadingState, setUploadingState] = useState({});

  useEffect(() => {
    setUiVariants(prevUiVariants => {
      const [primaryClassification, secondaryClassification] = classifications;
      if (!primaryClassification || !secondaryClassification) return [];
      const selectedPrimary = primaryClassification.options.filter(o => o.selected);
      const selectedSecondary = secondaryClassification.options.filter(o => o.selected);
      if (selectedPrimary.length === 0 || selectedSecondary.length === 0) return [];
      return selectedPrimary.map(primaryOpt => {
        const existingVariant = prevUiVariants.find(v => v.id === primaryOpt.id);
        return {
          id: primaryOpt.id, name: primaryOpt.name, images: primaryOpt.images,
          options: selectedSecondary.map(secondaryOpt => {
            const existingOption = existingVariant?.options.find(opt => opt.id === secondaryOpt.id);
            return {
              id: secondaryOpt.id, name: secondaryOpt.name,
              price: existingOption?.price || '', stock: existingOption?.stock || '', sku: existingOption?.sku || '',
            };
          }),
        };
      });
    });
  }, [classifications]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        variants: uiVariants,
        config: classifications.map(c => ({ name: c.name }))
      });
    }
  }, [uiVariants, classifications, onDataChange]);

  const updateOption = (classificationId, optionId, fieldsToUpdate) => {
    onClassificationsChange(prev => prev.map(c => c.id === classificationId ? { ...c, options: c.options.map(o => o.id === optionId ? { ...o, ...fieldsToUpdate } : o) } : c));
  };
  
  const updateOptionImages = (classificationId, optionId, newImagesArray) => {
    onClassificationsChange(prev => prev.map(c => c.id === classificationId ? { ...c, options: c.options.map(o => o.id === optionId ? { ...o, images: newImagesArray } : o) } : c));
  };

  const handleMultiImageUpload = async (classificationId, optionId, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    const optionToUpdate = classifications[0].options.find(o => o.id === optionId);
    if (optionToUpdate.images.length + files.length > MAX_IMAGES_PER_VARIANT) {
        alert(`Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES_PER_VARIANT} ảnh.`);
        return;
    }
    setUploadingState(prev => ({ ...prev, [optionId]: true }));
    try {
        const uploadPromises = files.map(file => uploadImageToServer(file));
        const uploadedImages = await Promise.all(uploadPromises);
        const newImages = [...optionToUpdate.images, ...uploadedImages];
        updateOptionImages(classificationId, optionId, newImages);
    } catch (error) {
        alert("Lỗi khi tải lên: " + error.message);
    } finally {
        setUploadingState(prev => ({ ...prev, [optionId]: false }));
    }
  };
  
  const handleImageRemove = async (classificationId, optionId, publicIdToRemove) => {
    const optionToUpdate = classifications[0].options.find(o => o.id === optionId);
    const imageToRemove = optionToUpdate.images.find(img => img.public_id === publicIdToRemove);
    if (!imageToRemove) return;
    try {
        await deleteImageFromServer(imageToRemove.public_id);
        const newImages = optionToUpdate.images.filter(img => img.public_id !== publicIdToRemove);
        updateOptionImages(classificationId, optionId, newImages);
    } catch (error) {
        alert("Lỗi khi xóa ảnh: " + error.message);
    }
  };

  const addOption = (classificationId) => {
    onClassificationsChange(prev => prev.map(c => {
      if (c.id === classificationId) {
        const newOption = { id: Date.now(), name: "", selected: true, ...(c.id === 1 && { images: [] }) };
        return { ...c, options: [...c.options, newOption] };
      }
      return c;
    }));
  };

  const removeOption = async (classificationId, optionId) => {
    const optionToRemove = classifications[0].options.find(o => o.id === optionId);
    if (optionToRemove?.images?.length > 0) {
        const deletePromises = optionToRemove.images.map(img => deleteImageFromServer(img.public_id));
        await Promise.all(deletePromises);
    }
    onClassificationsChange(prev => prev.map(c => c.id === classificationId ? { ...c, options: c.options.filter(o => o.id !== optionId) } : c));
  };
  
  const updateClassificationName = (id, name) => {
    onClassificationsChange(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };
  
  const applyBulkValues = () => {
    setUiVariants(prev => prev.map(variant => ({
      ...variant,
      options: variant.options.map(opt => {
        const skuSuffix = `${variant.name.toUpperCase()}-${opt.name.toUpperCase()}`;
        return { ...opt, price: bulkValues.price || opt.price, stock: bulkValues.stock || opt.stock, sku: bulkValues.skuPrefix ? `${bulkValues.skuPrefix}-${skuSuffix}` : opt.sku };
      }),
    })));
  };

  const handleDataChange = (primaryId, secondaryId, field, value) => {
    setUiVariants(prev => prev.map(v => v.id === primaryId ? { ...v, options: v.options.map(opt => opt.id === secondaryId ? { ...opt, [field]: value } : opt) } : v));
  };
  
  const hasVariants = uiVariants.length > 0;
  const [primaryClassification, secondaryClassification] = classifications;

  return (
    <>
      {classifications.map((classification, index) => (
        <div key={classification.id} className="classification-section">
          <div className="classification-header"><div className="classification-title">Phân loại {index + 1}</div></div>
          <input type="text" className="classification-name-input" value={classification.name} onChange={(e) => updateClassificationName(classification.id, e.target.value)} placeholder="Tên phân loại" />
          <div className="options-header"><div className="options-title">Các lựa chọn</div></div>
          <div className="options-grid">
            {classification.options.map((option) => (
              <div key={option.id} className={`option-item ${option.selected ? "selected" : ""}`}>
                <div className="option-header">
                  <input type="checkbox" className="option-checkbox" checked={option.selected} onChange={(e) => updateOption(classification.id, option.id, { selected: e.target.checked })} />
                  <button type="button" className="remove-option-btn" onClick={() => removeOption(classification.id, option.id)}>×</button>
                </div>
                <input type="text" className="option-input" value={option.name} onChange={(e) => updateOption(classification.id, option.id, { name: e.target.value })} placeholder="Tên lựa chọn" />
                {index === 0 && (
                  <div className="multi-image-uploader">
                    <div className="image-previews-grid">
                        {option.images.map(image => (
                            <div key={image.public_id} className="image-preview-item">
                                <img src={image.url} alt="preview" />
                                <button type="button" onClick={() => handleImageRemove(classification.id, option.id, image.public_id)}>×</button>
                            </div>
                        ))}
                        {option.images.length < MAX_IMAGES_PER_VARIANT && (
                            <label htmlFor={`multi-image-input-${option.id}`} className="upload-new-image-btn">
                                {uploadingState[option.id] ? "..." : "+"}
                            </label>
                        )}
                    </div>
                    <input id={`multi-image-input-${option.id}`} type="file" accept="image/*" multiple hidden onChange={(e) => handleMultiImageUpload(classification.id, option.id, e)}/>
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
          {hasVariants && (<div className="bulk-input-section"><div className="bulk-input-header"><div className="bulk-input-title">Nhập giá trị chung</div><button type="button" className="bulk-apply-btn" onClick={applyBulkValues}>Áp dụng</button></div><div className="bulk-input-grid"><input type="text" className="bulk-input" value={bulkValues.price} onChange={(e) => setBulkValues({ ...bulkValues, price: e.target.value })} placeholder="Giá" /><input type="text" className="bulk-input" value={bulkValues.stock} onChange={(e) => setBulkValues({ ...bulkValues, stock: e.target.value })} placeholder="Kho" /><input type="text" className="bulk-input" value={bulkValues.skuPrefix} onChange={(e) => setBulkValues({ ...bulkValues, skuPrefix: e.target.value })} placeholder="Tiền tố SKU" /></div></div>)}
          {hasVariants ? (
            <div className="price-inventory-grid">
              <div className="table-header-cell">{primaryClassification.name}</div>
              <div className="table-header-cell">{secondaryClassification.name}</div>
              <div className="table-header-cell">*Giá</div>
              <div className="table-header-cell">*Kho hàng</div>
              <div className="table-header-cell">SKU phân loại</div>
              <div className="table-container">
                {uiVariants.map(primaryVariant => (
                  primaryVariant.options.map((secondaryVariant, secondaryIndex) => (
                    <React.Fragment key={`${primaryVariant.id}-${secondaryVariant.id}`}>
                      {secondaryIndex === 0 && (
                        <div className="table-cell parent-cell" style={{ gridRow: `span ${primaryVariant.options.length}` }}>
                            <div className="variant-info">
                                <img src={primaryVariant.images?.[0]?.url} alt={primaryVariant.name} className="variant-image" />
                                <span className="variant-name">{primaryVariant.name}</span>
                            </div>
                        </div>
                      )}
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