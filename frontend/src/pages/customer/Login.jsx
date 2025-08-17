import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services";
import Logo from "../../components/common/logo";
import { Eye, EyeOff } from "lucide-react";
import { usePopup } from "../../components/common/popupContext";
import "./Login.css";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmail = emailOrPhone.includes("@");
    const isPhone = /^[0-9+\-\s()]+$/.test(emailOrPhone);

    if (!isEmail && !isPhone) {
      setError("Vui lòng nhập đúng định dạng Email hoặc SĐT");
      showPopup(
        "Thông báo lỗi",
        "Vui lòng nhập đúng định dạng Email hoặc SĐT",
        "OK"
      );
      return;
    }

    try {
      const { token, user } = await loginUser(emailOrPhone, password);
      localStorage.setItem("user", JSON.stringify(user));
      //localStorage.setItem("token", token);

      if (rememberPassword) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
      window.dispatchEvent(new Event("loginStatusChanged"));
      showPopup("Thành công", "Bạn đã đăng nhập thành công", "OK");
      // Redirect to homepage or admin page
      if (user.user_type === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
        showPopup(
          "Thông báo lỗi",
          "Đăng nhập thất bại. Vui lòng thử lại.",
          "OK"
        );
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <div className="login-logo-section">
        <Logo size="medium" />
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-input-group">
          <input
            type="text"
            placeholder="Email/SĐT"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="login-form-input"
            required
            aria-label="Email hoặc Số điện thoại"
          />
        </div>

        <div className="login-input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-form-input"
            required
            aria-label="Mật khẩu"
          />
          <span
            className="password-toggle-icon-lg"
            onClick={() => setShowPassword((prev) => !prev)}
            role="button"
            aria-label="Hiện/Ẩn mật khẩu"
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {error && <div className="login-form-error">{error}</div>}

        <div className="login-form-options">
          <div className="login-checkbox-group">
            <input
              type="checkbox"
              id="remember"
              checked={rememberPassword}
              onChange={(e) => setRememberPassword(e.target.checked)}
              className="login-checkbox"
              aria-label="Nhớ mật khẩu"
            />
            <label htmlFor="remember" className="login-checkbox-label">
              Nhớ mật khẩu
            </label>
          </div>
          <Link to="/forgot-password" className="login-forgot-password-link">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="login-button-group">
          <button type="submit" className="login-button">
            ĐĂNG NHẬP
          </button>
        </div>
        <div className="login-register-link">
          <span>Bạn chưa có tài khoản? </span>
          <Link to="/registration" className="register-link">
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}
