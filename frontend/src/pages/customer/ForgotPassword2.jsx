"use client"

import { useState } from "react"
import "./ForgotPassword.css"

export default function ForgotPasswordStep2() {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Mật khẩu không khớp!")
      return
    }
    console.log("Changing password...")
    alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại...")
    // Logic to change password
  }

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h1 className="forgot-title">QUÊN MẬT KHẨU</h1>

        <div className="forgot-form-group">
          <label className="forgot-label">Mật khẩu mới</label>
          <input
            type="password"
            className="forgot-input"
            value={passwords.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
          />
        </div>

        <div className="forgot-form-group">
          <label className="forgot-label">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            className="forgot-input"
            value={passwords.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          />
        </div>

        <button className="forgot-button" onClick={handleSubmit}>
          ĐỔI MẬT KHẨU
        </button>
      </div>
    </div>
  )
}
