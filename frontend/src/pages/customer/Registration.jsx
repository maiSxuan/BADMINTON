import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Registration.css";
import Logo from "../../components/common/logo";
import { NavigationOff } from "lucide-react";

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
  // const [errors, setServerError] = useState("");
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

    if (!formData.email.trim())
      newErrors.email = "Email không được để trống";
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

    if (Object.keys(validateErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/auth/register",
          {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email,
            password: formData.password,
          }
        );

        localStorage.setItem("token", response.data.token);
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        if(user.user_type === 'ADMIN'){
          navigate("/admin");
        } else{
          navigate("/");
        }
      } catch (error) {
        const field = error.response?.data?.field;
        const message = error.response?.data?.message || "Đăng ký thất bại";

        if (field) {
          setErrors((prev) => ({ ...prev, [field]: message }));
        } else {
          alert(message);
        }
      }
    }
  };

  return (
    <div className="registration-container">
      {/* <div className="refund-container"> */}
        <div className="registration-content">
          <div className="registration-logo">
            <Logo size="medium" />
          </div>

          <div className="registration-form-container">
            <h1 className="registration-title">ĐĂNG KÝ</h1>

            <form onSubmit={handleSubmit} className="registration-form">
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
                    onChange={(e) =>
                      handleInputChange("name", e.target.value)
                    }
                    className="registration-form-input"
                  />
                  {errors.name && (
                    <span className="input-error-text">{errors.name}</span>
                  )}
                </div>
              </div>

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

              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.password ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="registration-form-input"
                  />
                  {errors.password && (
                    <span className="input-error-text">{errors.password}</span>
                  )}
                </div>
              </div>

              <div className="registration-form-group">
                <div
                  className={`registration-input-wrapper ${
                    errors.confirmPassword ? "registration-input-error" : ""
                  }`}
                >
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="registration-form-input"
                  />
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
          </div>
        </div>

      {/* </div> */}
    </div>
  );
};

export default Registration;
