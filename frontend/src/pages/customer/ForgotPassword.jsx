"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../services/AuthenticationService";
import "./ForgotPassword.css"

export default function ForgotPasswordStep1() {
  const [email, setEmail] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    if (showPopup && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (showPopup && countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, showPopup])

  const handleSubmit = async () => {
    if (!email) return alert("Vui lòng nhập email");
    try {
      await requestPasswordReset(email);
      setShowPopup(true);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi email hoặc email không tồn tại");
    }
  }

  const handleResend = async () => {
    if (canResend) {
      try {
        await requestPasswordReset(email);
        setCountdown(60);
        setCanResend(false);
        alert("Đã gửi lại mã xác nhận");
      } catch (err) {
        alert("Lỗi khi gửi lại: " + err.message);
      }
    }
  };

  const goToStep2 = () => {
    navigate("/recover-password", { state: { email } });
  };

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h1 className="forgot-title">QUÊN MẬT KHẨU</h1>

        <div className="forgot-form-group">
          <label className="forgot-label">Email</label>
          <input type="email" className="forgot-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <button className="forgot-button" onClick={handleSubmit}>
          LẤY LẠI MẬT KHẨU
        </button>
      </div>

      {showPopup && (
        <div className="forgot-overlay">
          <div className="forgot-popup">
            <h1 className="forgot-title">QUÊN MẬT KHẨU</h1>

            <p className="forgot-message">
              Xác nhận đã gửi qua email của bạn. Vui lòng kiểm tra và làm theo hướng dẫn.
              <br />
              Nếu chưa nhận được, vui lòng đợi sau {countdown}s.....
            </p>

            <button
              className={`forgot-button ${!canResend ? "disabled" : ""}`}
              onClick={handleResend}
              disabled={!canResend}
            >
              GỬI LẠI
            </button>
            <button className="forgot-button" onClick={goToStep2}>
              TIẾP TỤC
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
