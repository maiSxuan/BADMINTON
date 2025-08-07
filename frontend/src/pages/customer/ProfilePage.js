import React, { useState, useEffect, useRef } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { getProfile, updateProfile } from "../../services/UsersService";

const ProfilePage = () => {
  const inputRefs = useRef({});
  const navigate = useNavigate();

  // State lưu giá trị form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State lưu lỗi
  const [errors, setErrors] = useState({});
  const [editField, setEditField] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const data = await getProfile(token);
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          date_of_birth: data.date_of_birth
            ? data.date_of_birth.split("T")[0]
            : "",
        }));
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Nếu chỉ nhập 1 trong 3 ô mật khẩu thì báo lỗi
    const passwordFields = [
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword,
    ];
    const filledPasswordCount = passwordFields.filter(Boolean).length;

    if (filledPasswordCount > 0 && filledPasswordCount < 3) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      }
      if (!formData.newPassword) {
        newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
      }
    }

    // So sánh mật khẩu mới và xác nhận
    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    setErrors(newErrors);

    // Nếu không có lỗi thì lưu và chuyển trang
    if (Object.keys(newErrors).length === 0) {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        // Tạo object mới chỉ chứa các field cần thiết
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth
            ? new Date(formData.date_of_birth).toISOString()
            : null,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        };

        await updateProfile(token, payload);
        alert("Cập nhật thông tin thành công!");
        navigate("/account/profile");
      } catch (err) {
        console.error("Update error:", err.response?.data);
        alert(err.response?.data?.message || "Lỗi khi cập nhật thông tin");
      }
    }
  };

  const fields = [
    { label: "Tên đăng nhập", name: "name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Số điện thoại", name: "phone", type: "text" },
    { label: "Giới tính", name: "gender", type: "text" },
    { label: "Ngày sinh", name: "date_of_birth", type: "date" },
  ];

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  return (
    <div className="profile-page">
      <div className="profile-box">
        <h2 className="profile-title">Hồ sơ của tôi</h2>
        <p className="profile-subtitle">
          Quản lí thông tin hồ sơ để bảo mật tài khoản
        </p>

        <form className="profile-form" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="form-row" key={f.name}>
              <label>{f.label}</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type={f.type}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  readOnly={editField !== f.name}
                  ref={(el) => (inputRefs.current[f.name] = el)}
                  placeholder="Chưa có thông tin"
                  className={errors[f.name] ? "input-error" : ""}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditField(f.name);
                    setFormData((prev) => ({
                      ...prev,
                      [f.name]: "",
                    }));
                    setTimeout(() => {
                      inputRefs.current[f.name]?.focus();
                    }, 0);
                  }}
                  style={{ marginLeft: "5px" }}
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}

          <h3 className="password-title">Đổi mật khẩu:</h3>

          {/* Mật khẩu hiện tại */}
          <div className="form-row">
            <label>Mật khẩu hiện tại:</label>
            <div className="input-wrapper">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi"
                className={errors.currentPassword ? "input-error" : ""}
              />
              <span
                className="eye-icon"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
              >
                {showPasswords.current ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </span>
            </div>
            {errors.currentPassword && (
              <span className="error-text">{errors.currentPassword}</span>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="form-row">
            <label>Mật khẩu mới:</label>
            <div className="input-wrapper">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    new: !prev.new,
                  }))
                }
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Nhập lại mật khẩu */}
          <div className="form-row">
            <label>Nhập lại mật khẩu mới:</label>
            <div className="input-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              <span
                className="eye-icon"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
              >
                {showPasswords.confirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </span>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="btn-container">
            <button type="submit" className="btn-save">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
