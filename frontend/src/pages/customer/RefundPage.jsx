"use client"

import { useState } from "react"
import "./RefundPage.css"
import { useNavigate } from "react-router-dom";

export default function ReturnRefundForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    request: "",
    reason: "",
    description: "",
  });

  const navigate = useNavigate(); 

  const handleSend = () => {
    setShowSuccess(true);
    //////////////// LOGIC SEND Ở ĐÂY
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReturnHome = () => {
    navigate("/"); 
  };

  return (
    <div className="refund-container">
      <h1 className="title">Yêu cầu trả hàng/hoàn tiền</h1>

      <div className="form-container">
        <div className="form-group">
          <label className="label">Yêu cầu</label>
          <select
            className="dropdown"
            value={formData.request}
            onChange={(e) => handleInputChange("request", e.target.value)}
          >
            <option value="tra-hang">Trả hàng</option>
            <option value="hoan-tien">Hoàn tiền</option>
          </select>
        </div>

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
