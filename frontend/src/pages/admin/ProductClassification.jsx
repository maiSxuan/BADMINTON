"use client"

import { useState } from "react"
import "./ProductClassification.css"

const ProductClassification = () => {
  const [classifications, setClassifications] = useState([
    {
      id: 1,
      name: "Size",
      options: [
        { id: 1, name: "M", image: null, selected: true, price: "299000", stock: "50", sku: "PRD-M" },
        { id: 2, name: "L", image: null, selected: true, price: "319000", stock: "30", sku: "PRD-L" },
      ],
    },
  ])

  const [savedClassifications, setSavedClassifications] = useState([
    {
      id: 1,
      name: "Size Standard",
      classification: "Size",
      variant: "M",
      price: "299000",
      stock: "100",
      sku: "STD-M",
      image: null,
      savedAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Size Standard",
      classification: "Size",
      variant: "L",
      price: "319000",
      stock: "80",
      sku: "STD-L",
      image: null,
      savedAt: "2024-01-15",
    },
    {
      id: 3,
      name: "Color Basic",
      classification: "Màu sắc",
      variant: "Đỏ",
      price: "350000",
      stock: "60",
      sku: "CLR-RED",
      image: null,
      savedAt: "2024-01-14",
    },
  ])

  const [applySettings, setApplySettings] = useState({
    price: false,
    stock: false,
    sku: false,
  })

  const [bulkValues, setBulkValues] = useState({
    price: "",
    stock: "",
    skuPrefix: "",
  })

  // Add new classification group
  const addClassification = () => {
    const newId = Math.max(...classifications.map((c) => c.id), 0) + 1
    setClassifications([
      ...classifications,
      {
        id: newId,
        name: "",
        options: [{ id: 1, name: "", image: null, selected: false, price: "", stock: "", sku: "" }],
      },
    ])
  }

  // Update classification name
  const updateClassificationName = (classificationId, name) => {
    setClassifications(classifications.map((c) => (c.id === classificationId ? { ...c, name } : c)))
  }

  // Add option to classification
  const addOption = (classificationId) => {
    setClassifications(
      classifications.map((c) => {
        if (c.id === classificationId) {
          const newOptionId = Math.max(...c.options.map((o) => o.id), 0) + 1
          return {
            ...c,
            options: [
              ...c.options,
              {
                id: newOptionId,
                name: "",
                image: null,
                selected: false,
                price: "",
                stock: "",
                sku: "",
              },
            ],
          }
        }
        return c
      }),
    )
  }

  // Remove option from classification
  const removeOption = (classificationId, optionId) => {
    setClassifications(
      classifications.map((c) => {
        if (c.id === classificationId) {
          return {
            ...c,
            options: c.options.filter((o) => o.id !== optionId),
          }
        }
        return c
      }),
    )
  }

  // Update option
  const updateOption = (classificationId, optionId, field, value) => {
    setClassifications(
      classifications.map((c) => {
        if (c.id === classificationId) {
          return {
            ...c,
            options: c.options.map((o) => (o.id === optionId ? { ...o, [field]: value } : o)),
          }
        }
        return c
      }),
    )
  }

  // Handle image upload
  const handleImageUpload = (classificationId, optionId, event) => {
    const file = event.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      updateOption(classificationId, optionId, "image", imageUrl)
    }
  }

  // Get all selected variants for the table
  const getSelectedVariants = () => {
    const variants = []
    classifications.forEach((classification) => {
      classification.options.forEach((option) => {
        if (option.selected) {
          variants.push({
            classificationId: classification.id,
            classificationName: classification.name,
            ...option,
          })
        }
      })
    })
    return variants
  }

  // Apply settings to all selected variants
  const applyToAll = () => {
    const selectedVariants = getSelectedVariants()
    if (selectedVariants.length === 0) return

    const firstVariant = selectedVariants[0]

    setClassifications(
      classifications.map((classification) => ({
        ...classification,
        options: classification.options.map((option) => {
          if (!option.selected) return option

          const updates = {}
          if (applySettings.price) updates.price = firstVariant.price
          if (applySettings.stock) updates.stock = firstVariant.stock
          if (applySettings.sku) {
            // Generate unique SKU for each variant
            updates.sku = `${firstVariant.sku.split("-")[0]}-${option.name.toUpperCase()}`
          }

          return { ...option, ...updates }
        }),
      })),
    )
  }

  // Apply bulk values to all selected variants
  const applyBulkValues = () => {
    const selectedVariants = getSelectedVariants()
    if (selectedVariants.length === 0) return

    setClassifications(
      classifications.map((classification) => ({
        ...classification,
        options: classification.options.map((option) => {
          if (!option.selected) return option

          const updates = {}
          if (bulkValues.price) updates.price = bulkValues.price
          if (bulkValues.stock) updates.stock = bulkValues.stock
          if (bulkValues.skuPrefix) {
            updates.sku = `${bulkValues.skuPrefix}-${option.name.toUpperCase()}`
          }

          return { ...option, ...updates }
        }),
      })),
    )

    // Clear bulk values after applying
    setBulkValues({ price: "", stock: "", skuPrefix: "" })
  }

  // Save current classifications
  const saveCurrentClassifications = () => {
    const selectedVariants = getSelectedVariants()
    if (selectedVariants.length === 0) return

    const newSavedItems = selectedVariants.map((variant, index) => ({
      id: Math.max(...savedClassifications.map((s) => s.id), 0) + index + 1,
      name: `${variant.classificationName} Custom`,
      classification: variant.classificationName,
      variant: variant.name,
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
      image: variant.image,
      savedAt: new Date().toISOString().split("T")[0],
    }))

    setSavedClassifications([...savedClassifications, ...newSavedItems])
  }

  // Load saved classification
  const loadSavedClassification = (savedItem) => {
    // Find or create classification group
    let targetClassification = classifications.find((c) => c.name === savedItem.classification)

    if (!targetClassification) {
      const newId = Math.max(...classifications.map((c) => c.id), 0) + 1
      targetClassification = {
        id: newId,
        name: savedItem.classification,
        options: [],
      }
      setClassifications([...classifications, targetClassification])
    }

    // Add the saved option to the classification
    const newOptionId = Math.max(...targetClassification.options.map((o) => o.id), 0) + 1
    const newOption = {
      id: newOptionId,
      name: savedItem.variant,
      image: savedItem.image,
      selected: true,
      price: savedItem.price,
      stock: savedItem.stock,
      sku: savedItem.sku,
    }

    setClassifications(
      classifications.map((c) => (c.id === targetClassification.id ? { ...c, options: [...c.options, newOption] } : c)),
    )
  }

  // Delete saved classification
  const deleteSavedClassification = (savedId) => {
    setSavedClassifications(savedClassifications.filter((s) => s.id !== savedId))
  }

  const selectedVariants = getSelectedVariants()
  const hasSelectedVariants = selectedVariants.length > 0
  const hasBulkValues = bulkValues.price || bulkValues.stock || bulkValues.skuPrefix

  return (
    <div className="sales-info-container">
      {/* Classification Sections */}
      {classifications.map((classification, index) => (
        <div key={classification.id} className="classification-section">
          <div className="classification-header">
            <div className="classification-title">
              Phân loại hàng {index + 1} {classification.name && `(${classification.name})`}
            </div>
            {index === classifications.length - 1 && (
              <button className="add-classification-btn" onClick={addClassification}>
                + Thêm nhóm phân loại {index + 2}
              </button>
            )}
          </div>

          <input
            type="text"
            className="classification-name-input"
            value={classification.name}
            onChange={(e) => updateClassificationName(classification.id, e.target.value)}
            placeholder="Ví dụ: Size, Màu sắc, Chất liệu..."
          />

          <div className="options-header">
            <div className="options-title">Các lựa chọn {classification.name || "phân loại"}</div>
            <button className="add-option-btn" onClick={() => addOption(classification.id)}>
              + Thêm lựa chọn
            </button>
          </div>

          <div className="options-grid">
            {classification.options.map((option) => (
              <div key={option.id} className={`option-item ${option.selected ? "selected" : ""}`}>
                <div className="option-header">
                  <input
                    type="checkbox"
                    className="option-checkbox"
                    checked={option.selected}
                    onChange={(e) => updateOption(classification.id, option.id, "selected", e.target.checked)}
                  />
                  <button className="remove-option-btn" onClick={() => removeOption(classification.id, option.id)}>
                    ×
                  </button>
                </div>

                <input
                  type="text"
                  className="option-input"
                  value={option.name}
                  onChange={(e) => updateOption(classification.id, option.id, "name", e.target.value)}
                  placeholder="Tên lựa chọn"
                />

                <div
                  className="image-upload-area"
                  onClick={() => document.getElementById(`image-${classification.id}-${option.id}`).click()}
                >
                  {option.image ? (
                    <img src={option.image || "/placeholder.svg"} alt={option.name} className="uploaded-image" />
                  ) : (
                    <div className="image-upload-text">+ Thêm hình ảnh</div>
                  )}
                  <input
                    id={`image-${classification.id}-${option.id}`}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageUpload(classification.id, option.id, e)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Price and Inventory Table */}
      <div className="price-inventory-section">
        <div className="price-inventory-title">Thiết lập giá và tồn kho</div>

        {/* Bulk Input Section */}
        {hasSelectedVariants && (
          <div className="bulk-input-section">
            <div className="bulk-input-header">
              <div className="bulk-input-title">Nhập giá trị chung cho nhiều sản phẩm</div>
              <button className="bulk-apply-btn" onClick={applyBulkValues} disabled={!hasBulkValues}>
                Áp dụng cho tất cả
              </button>
            </div>

            <div className="bulk-input-grid">
              <div className="bulk-input-field">
                <label className="bulk-input-label">Giá bán chung (VNĐ)</label>
                <input
                  type="text"
                  className="bulk-input"
                  value={bulkValues.price}
                  onChange={(e) => setBulkValues({ ...bulkValues, price: e.target.value })}
                  placeholder="Ví dụ: 299000"
                />
              </div>
              <div className="bulk-input-field">
                <label className="bulk-input-label">Tồn kho chung</label>
                <input
                  type="text"
                  className="bulk-input"
                  value={bulkValues.stock}
                  onChange={(e) => setBulkValues({ ...bulkValues, stock: e.target.value })}
                  placeholder="Ví dụ: 100"
                />
              </div>
              <div className="bulk-input-field">
                <label className="bulk-input-label">Tiền tố SKU chung</label>
                <input
                  type="text"
                  className="bulk-input"
                  value={bulkValues.skuPrefix}
                  onChange={(e) => setBulkValues({ ...bulkValues, skuPrefix: e.target.value })}
                  placeholder="Ví dụ: PRD"
                />
              </div>
            </div>
          </div>
        )}

        {hasSelectedVariants ? (
          <div className="table-container">
            <div className="table-header">
              <div className="table-header-cell">Chọn</div>
              <div className="table-header-cell">Phân loại</div>
              <div className="table-header-cell">Giá bán (VNĐ)</div>
              <div className="table-header-cell">Tồn kho</div>
              <div className="table-header-cell">SKU (Mã kho)</div>
            </div>

            {selectedVariants.map((variant) => (
              <div key={`${variant.classificationId}-${variant.id}`} className="table-row">
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    className="row-checkbox"
                    checked={variant.selected}
                    onChange={(e) => updateOption(variant.classificationId, variant.id, "selected", e.target.checked)}
                  />
                </div>
                <div className="table-cell">
                  <div className="variant-info">
                    {variant.image && (
                      <img src={variant.image || "/placeholder.svg"} alt={variant.name} className="variant-image" />
                    )}
                    <span className="variant-name">
                      {variant.classificationName}: {variant.name}
                    </span>
                  </div>
                </div>
                <div className="table-cell">
                  <input
                    type="text"
                    className="table-input"
                    value={variant.price}
                    onChange={(e) => updateOption(variant.classificationId, variant.id, "price", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="table-cell">
                  <input
                    type="text"
                    className="table-input"
                    value={variant.stock}
                    onChange={(e) => updateOption(variant.classificationId, variant.id, "stock", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="table-cell">
                  <input
                    type="text"
                    className="table-input"
                    value={variant.sku}
                    onChange={(e) => updateOption(variant.classificationId, variant.id, "sku", e.target.value)}
                    placeholder="Mã SKU"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-variants-message">Vui lòng chọn ít nhất một phân loại để thiết lập giá và tồn kho</div>
        )}
        <div className="save-button-wrapper">
            <button className="save-current-btn">Lưu</button>
          </div>

        {/* Saved Classifications Section */}
      <div className="saved-classifications-section">
        <div className="saved-classifications-header">
          <div className="saved-classifications-title">Bảng phân loại đã lưu</div>
          
        </div>
      </div>

      

        {savedClassifications.length > 0 ? (
          <div className="saved-table-container">
            <div className="saved-table-header">
              <div className="saved-table-header-cell">Tên phân loại</div>
              <div className="saved-table-header-cell">Loại</div>
              <div className="saved-table-header-cell">Biến thể</div>
              <div className="saved-table-header-cell">Giá (VNĐ)</div>
              <div className="saved-table-header-cell">Tồn kho</div>
              <div className="saved-table-header-cell">SKU</div>
              <div className="saved-table-header-cell">Thao tác</div>
            </div>

            {savedClassifications.map((savedItem) => (
              <div key={savedItem.id} className="saved-table-row">
                <div className="saved-table-cell">
                  <div className="saved-variant-info">
                    {savedItem.image && (
                      <img
                        src={savedItem.image || "/placeholder.svg"}
                        alt={savedItem.variant}
                        className="saved-variant-image"
                      />
                    )}
                    {savedItem.name}
                  </div>
                </div>
                <div className="saved-table-cell">{savedItem.classification}</div>
                <div className="saved-table-cell">{savedItem.variant}</div>
                <div className="saved-table-cell">{savedItem.price}</div>
                <div className="saved-table-cell">{savedItem.stock}</div>
                <div className="saved-table-cell">{savedItem.sku}</div>
                <div className="saved-table-cell">
                  <button className="delete-saved-btn" onClick={() => deleteSavedClassification(savedItem.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-saved-message">Chưa có phân loại nào được lưu</div>
        )}
      </div>
    </div>
  )
}

export default ProductClassification
