// import { useState } from "react";
// import { Link } from "react-router-dom";
// import Logo from "../../components/common/logo";
// import "./Login.css";

// export default function Login() {
//   const [emailOrPhone, setEmailOrPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberPassword, setRememberPassword] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const isEmail = emailOrPhone.includes("@");
//     const isPhone = /^[0-9+\-\s()]+$/.test(emailOrPhone);

//     if (!isEmail && !isPhone) {
//       setError("Vui lòng nhập đúng định dạng Email hoặc SĐT");
//       return;
//     }

//     setError("");

//     const loginType = isEmail ? "email" : "phone";

//     const loginData = {
//       password,
//       rememberPassword,
//       loginType,
//       [loginType]: emailOrPhone,
//     };

//     console.log("Login attempt:", loginData);
//   };

//   return (
//     <div className="login-container">
//       <div className="logo-section">
//         <Logo size="medium" />
//       </div>

//       <form className="login-form" onSubmit={handleSubmit}>
//         <div className="input-group">
//           <input
//             type="text"
//             placeholder="Email/SĐT"
//             value={emailOrPhone}
//             onChange={(e) => setEmailOrPhone(e.target.value)}
//             className="form-input"
//             required
//             aria-label="Email hoặc Số điện thoại"
//           />
//         </div>

//         <div className="input-group">
//           <input
//             type="password"
//             placeholder="Mật khẩu"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="form-input"
//             required
//             aria-label="Mật khẩu"
//           />
//         </div>

//         {error && <div className="form-error">{error}</div>}

//         <div className="form-options">
//           <div className="checkbox-group">
//             <input
//               type="checkbox"
//               id="remember"
//               checked={rememberPassword}
//               onChange={(e) => setRememberPassword(e.target.checked)}
//               className="checkbox"
//               aria-label="Nhớ mật khẩu"
//             />

//             <label htmlFor="remember" className="checkbox-label">
//               Nhớ mật khẩu
//             </label>
//           </div>

//           <Link to="/forgot-password" className="forgot-password-link">
//             Quên mật khẩu ?
//           </Link>
//         </div>

//         <div className="button-group">
//           <button type="submit" className="login-button">
//             ĐĂNG NHẬP
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../components/common/logo";
import "./Login.css";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmail = emailOrPhone.includes("@");
    const isPhone = /^[0-9+\-\s()]+$/.test(emailOrPhone);

    if (!isEmail && !isPhone) {
      setError("Vui lòng nhập đúng định dạng Email hoặc SĐT");
      return;
    }

    const loginType = isEmail ? "email" : "phone";

    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", {
        [loginType]: emailOrPhone,
        password: password
      });

      const { token, user } = response.data;
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberPassword) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      // Redirect to homepage or admin page
      if (user.email.endsWith("@admin.com")) {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  };

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
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-form-input"
            required
            aria-label="Mật khẩu"
          />
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
      </form>
    </div>
  );
}
