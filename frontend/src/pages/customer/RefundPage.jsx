"use client"

import { useState } from "react"
import "./RefundPage.css"

export default function ReturnRefundForm({ order, onSubmit, onBack }) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    request: "", // This field is commented out in the original, but kept for structure
    reason: "",
    description: "",
  })

  const handleSend = async () => {
    // Logic to send the request and update the order
    try {
      const response = await fetch(`http://localhost:4000/api/order/${order._id}/request-return-refund`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_reason: formData.reason,
          status: "Yêu cầu trả hàng/hoàn tiền",
        }),
      })

      if (response.ok) {
        const updatedOrder = {
          ...order,
          return_reason: formData.reason,
          status: "Yêu cầu trả hàng/hoàn tiền",
        }
        setShowSuccess(true)
        onSubmit(updatedOrder) // Notify parent component about the update
      } else {
        alert("Có lỗi xảy ra khi gửi yêu cầu trả hàng/hoàn tiền.")
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu trả hàng/hoàn tiền:", error)
      alert("Có lỗi xảy ra khi gửi yêu cầu trả hàng/hoàn tiền.")
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleReturnHome = () => {
    window.location.href = "/" // Navigate to home page
  }

  return (
    <div className="refund-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="title">Yêu cầu trả hàng/hoàn tiền</h1>
      </div>

      <div className="form-container">
        {/* <div className="form-group">
          <label className="label">Yêu cầu</label>
          <select
            className="dropdown"
            value={formData.request}
            onChange={(e) => handleInputChange("request", e.target.value)}
          >
            <option value="tra-hang">Trả hàng</option>
            <option value="hoan-tien">Hoàn tiền</option>
          </select>
        </div> */}
        <div className="form-group">
          <label className="label">Lý do</label>
          <input
            type="text"
            className="input"
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="label">Mô tả</label>
          <textarea
            className="textarea"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          ></textarea>
        </div>
        <div className="send-button-container">
          <button className="send-button" onClick={handleSend}>
            GỬI
          </button>
        </div>
        {showSuccess && (
          <div className="overlay">
            <div className="popup">
              <div className="success-content">
                <h3>Gửi yêu cầu thành công!</h3>
                <p>Cửa hàng sẽ liên hệ bạn qua email và số điện thoại trong vòng 1 - 2 ngày.</p>
                <button className="home-button" onClick={handleReturnHome}>
                  QUAY VỀ TRANG CHỦ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
