import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, verifyOtp } from "../../services";
import "./Registration.css";
import Logo from "../../components/common/logo";
import { Eye, EyeOff } from "lucide-react";

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register"); // 'register' | 'verify'
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!formData.name.trim())
      newErrors.name = "Tên đăng nhập không được để trống";
    if (!formData.phone.trim())
      newErrors.phone = "Số điện thoại không được để trống";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Số điện thoại này không hợp lệ";

    if (!formData.address.trim())
      newErrors.address = "Địa chỉ không được để trống";

    if (!formData.email.trim()) newErrors.email = "Email không được để trống";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.password.trim())
      newErrors.password = "Mật khẩu không được để trống";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Mật khẩu xác nhận không chính xác";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validate();
    setErrors(validateErrors);
    setServerError("");

    if (Object.keys(validateErrors).length === 0) {
      try {
        await registerUser(formData);
        setStep("verify");
        //const user = response.data.user;
        // localStorage.setItem("token", response.data.token);
        // localStorage.setItem("user", JSON.stringify(user));
        //window.dispatchEvent(new Event("loginStatusChanged"));

        // if(user.user_type === 'ADMIN'){
        //   navigate("/admin");
        // } else{
        //   navigate("/");
        // }
        // alert("Đăng ký thành công! Vui lòng đăng nhập.");
        // navigate("/login")
      } catch (error) {
        const field = error.response?.data?.field;
        const message = error.response?.data?.message || "Đăng ký thất bại";

        if (field) {
          setErrors((prev) => ({ ...prev, [field]: message }));
        } else {
          setServerError(message);
        }
      }
    }
  };

  // const handleRegister = async (e) => {
  //   e.preventDefault();
  //   setServerError("");
  //   try {
  //     await registerUser(formData);
  //     setEmail(formData.email); // lưu lại email để dùng cho xác minh
  //     setStep("verify");
  //   } catch (err) {
  //     setServerError(err.response?.data?.message || "Đăng ký thất bại");
  //   }
  // };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ email: formData.email, otp });
      alert("Xác minh thành công. Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      setServerError(err.response?.data?.message || "Xác minh thất bại");
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="registration-container">
      <div className="registration-content">
        <div className="registration-logo">
          <Logo size="medium" />
        </div>

        <div className="registration-form-container">
          <h1 className="registration-title">
            {step === "register" ? "ĐĂNG KÝ" : "XÁC MINH EMAIL"}
          </h1>

          {step === "register" ? (
            <form onSubmit={handleSubmit} className="registration-form">
              {/* Tên đăng nhập */}
              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.name ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="registration-form-input"
                  />
                  {errors.name && (
                    <span className="input-error-text">{errors.name}</span>
                  )}
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.phone ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="registration-form-input"
                  />
                  {errors.phone && (
                    <span className="input-error-text">{errors.phone}</span>
                  )}
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.address ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="registration-form-input"
                  />
                  {errors.address && (
                    <span className="input-error-text">{errors.address}</span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.email ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="registration-form-input"
                  />
                  {errors.email && (
                    <span className="input-error-text">{errors.email}</span>
                  )}
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.password ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="registration-form-input"
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                  {errors.password && (
                    <span className="input-error-text">{errors.password}</span>
                  )}
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.confirmPassword ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="registration-form-input"
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </span>
                  {errors.confirmPassword && (
                    <span className="input-error-text">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="registration-submit-button">
                ĐĂNG KÝ
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="registration-form">
              <div className="registration-form-group">
                <input
                  type="text"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="registration-form-input"
                />
              </div>
              <button type="submit" className="registration-submit-button">
                XÁC MINH
              </button>
              {serverError && (
                <div className="input-error-text">{serverError}</div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
