"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../services";
import "./ForgotPassword.css"
import { usePopup } from "../../components/common/popupContext";

export default function ForgotPasswordStep1() {
  const [email, setEmail] = useState("")
  const [displayPopup, setDisplayPopup] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate();

  const { showPopup } = usePopup()

  useEffect(() => {
    if (displayPopup && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (displayPopup && countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, displayPopup])

  const handleSubmit = async () => {
    if (!email) 
      // return alert("Vui lòng nhập email");
      return showPopup(
        'Thông báo',
        'Vui lòng nhập email',
        null,
        null,
        4,
        3
      )
    try {
      await requestPasswordReset(email);
      setDisplayPopup(true);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      // alert(err.response?.data?.message || "Lỗi gửi email hoặc email không tồn tại");
      showPopup(
        'Lỗi',
        err.message || 'Lỗi gửi email hoặc email không tồn tại',
        null,
        null,
        4,
        3
      )
    }
  }

  const handleResend = async () => {
    if (canResend) {
      try {
        await requestPasswordReset(email);
        setCountdown(60);
        setCanResend(false);
        // alert("Đã gửi lại mã xác nhận");
        showPopup(
          'Thông báo',
          'Đã gửi lại mã xác nhận',
          null,
          null,
          4,
          3
        )
      } catch (err) {
        // alert("Lỗi khi gửi lại: " + err.message);
        showPopup(
          'Lỗi',
          err.message || 'Lỗi khi gửi lại mã xác nhận',
          null,
          null,
          4,
          3
        )
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

      {displayPopup && (
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
