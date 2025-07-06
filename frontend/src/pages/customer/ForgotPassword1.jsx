"use client"

import { useState, useEffect } from "react"
import "./ForgotPassword.css"

export default function ForgotPasswordStep1() {
  const [email, setEmail] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (showPopup && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (showPopup && countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, showPopup])

  const handleSubmit = () => {
    if (email) {
      console.log("Sending reset email to:", email)
      setShowPopup(true)
      setCountdown(60)
      setCanResend(false)
    }
  }

  const handleResend = () => {
    if (canResend) {
      setCountdown(60)
      setCanResend(false)
      console.log("Resending email...")
    }
  }

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
          </div>
        </div>
      )}
    </div>
  )
}
