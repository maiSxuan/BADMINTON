import { useState } from "react";
import Logo from "../../components/common/logo";
import "./Login.css";

export default function Login() {
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [rememberPassword, setRememberPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault()
        
        const isEmail = emailOrPhone.includes("@")
        const isPhone = /^[0-9+\-\s()]+$/.test(emailOrPhone)

        if (!isEmail && !isPhone) {
            setError("Vui lòng nhập đúng định dạng Email hoặc SĐT")
            return
        }

        setError("");

        const loginType = isEmail ? "email" : "phone"

        const loginData = {
            password,
            rememberPassword,
            loginType,
            [loginType]: emailOrPhone
        };

        console.log("Login attempt:", loginData)
    }

    return (
        <div className="login-container">
            <div className="logo-section">
                <Logo size="medium" />
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <input 
                        type="text"
                        placeholder="Email/SĐT" 
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        className="form-input"
                        required    
                        aria-label="Email hoặc Số điện thoại"
                    />
                </div>

                <div className="input-group">
                    <input 
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        required 
                        aria-label="Mật khẩu"
                    />
                </div>

                {error && <div className="form-error">{ error }</div>}

                <div className="form-options">
                    <div className="checkbox-group">
                        <input 
                            type="checkbox"
                            id="remember"
                            checked={rememberPassword}
                            onChange={(e) => setRememberPassword(e.target.checked)}
                            className="checkbox" 
                            aria-label="Nhớ mật khẩu"
                        />

                        <label htmlFor="remember" className="checkbox-label">
                            Nhớ mật khẩu
                        </label>
                    </div>

                    <button type="button" className="forgot-password-link">
                        Quên mật khẩu ?
                    </button>
                </div>

                <div className="button-group">
                    <button type="submit" className="login-button">
                        ĐĂNG NHẬP
                    </button>
                </div>
            </form>
        </div>
    )
}

