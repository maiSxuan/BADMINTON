"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services";
import "./ForgotPassword.css"

import { usePopup } from "../../components/common/popupContext";

export default function ForgotPasswordStep2() {
  const [code, setCode] = useState("");
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  
  const { showPopup } = usePopup();

  const handleInputChange = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async() => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      // alert("Mật khẩu không khớp!")
      showPopup(
        'Thông báo',
        'Mật khẩu không khớp',
        null,
        null,
        4,
        2
      )
      return
    }
    if (!code) {
      // alert("Vui lòng nhập mã xác nhận!");
      showPopup(
        'Thông báo',
        'Vui lòng nhập mã xác nhận',
        null,
        null,
        4,
        2
      )
      return;
    }
    try {
      await resetPassword(email, code, passwords.newPassword);
      // alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      showPopup(
        "Thông báo",
        "Đổi mật khẩu thành công! Vui lòng đăng nhập lại",
        "Đăng nhập",
        () => navigate("/login"),
        4,
        3
      );
      // navigate("/login");
    } catch (err) {
      // alert(err.message);
      showPopup(
        'Lỗi',
        err.message,
        null,
        null,
        4,
        3
      )
    }
  }

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h1 className="forgot-title">ĐẶT LẠI MẬT KHẨU</h1>
        <div className="forgot-form-group">
          <label className="forgot-label">Mã xác nhận (6 số)</label>
          <input
            type="text"
            className="forgot-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
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
  );
}