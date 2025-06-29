import { useState } from "react"
import "./Registration.css"
import Logo from "../../components/common/logo"

const Registration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!formData.fullName.trim())
      newErrors.fullName = "Họ và tên không được để trống";
    if (!formData.phone.trim())
      newErrors.phone = "Số điện thoại không được để trống";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Số điện thoại này không hợp lệ";

    if (!formData.address.trim())
      newErrors.address = "Địa chỉ không được để trống";

    if (!formData.email.trim())
      newErrors.email = "Email không được để trống";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.password.trim())
      newErrors.password = "Mật khẩu không được để trống";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Mật khẩu xác nhận không chính xác";

    return newErrors;
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validateErrors = validate();
    setErrors(validateErrors);
    
    if (Object.keys(validateErrors).length === 0)
      console.log("Form submitted:", formData)
  }

  const ErrorText = ({ message }) => (
    <span style={{ color: "red", fontSize: "0.875rem" }}>{ message }</span>
  );

  return (
    <div className="container">
      <div className="main-content">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-container">
            <Logo size="medium" />
          </div>
        </div>

        {/* Registration Form */}
        <div className="form-section">
          <div className="form-container">
            <h1 className="form-title">ĐĂNG KÝ</h1>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="form-input"
                />
                {errors.fullName && <ErrorText message={errors.fullName} />}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="form-input"
                />
                {errors.phone && <ErrorText message={errors.phone} />}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Địa chỉ
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="form-input"
                />
                {errors.address && <ErrorText message={errors.address} />}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="form-input"
                />
                {errors.email && <ErrorText message={errors.email} />}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Nhập mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="form-input"
                />
                {errors.password && <ErrorText message={errors.password} />}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="form-input"
                />
                {errors.confirmPassword && <ErrorText message={errors.confirmPassword} />}
              </div>

              <button type="submit" className="submit-button">
                ĐĂNG KÝ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registration
