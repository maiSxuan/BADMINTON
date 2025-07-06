import React, { useState } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  // State lưu giá trị form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    gender: "",
    birthdate: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State lưu lỗi
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    for (const field in formData) {
      if (!formData[field].trim()) {
        newErrors[field] = "Ô đang trống";
      }
    }

    setErrors(newErrors);

    // Nếu không có lỗi thì lưu và chuyển trang
    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted!", formData);
      navigate("/");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-box">
        <h2 className="profile-title">Hồ sơ của tôi</h2>
        <p className="profile-subtitle">
          Quản lí thông tin hồ sơ để bảo mật tài khoản
        </p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={errors.username || ""} // dùng lỗi làm placeholder nếu có
              className={errors.username ? "input-error" : ""}
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={errors.email || ""} // dùng lỗi làm placeholder nếu có
              className={errors.email ? "input-error" : ""}
            />
          </div>

          <div className="form-row">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={errors.phone || ""} // dùng lỗi làm placeholder nếu có
              className={errors.phone ? "input-error" : ""}
            />
          </div>

          <div className="form-row">
            <label>Giới tính</label>
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder={errors.gender || ""} // dùng lỗi làm placeholder nếu có
              className={errors.gender ? "input-error" : ""}
            />
          </div>

          <div className="form-row">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              placeholder={errors.birthdate || ""} // dùng lỗi làm placeholder nếu có
              className={errors.birthdate ? "input-error" : ""}
            />
          </div>

          <h3 className="password-title">Đổi mật khẩu:</h3>

          <div className="form-row">
            <label>Mật khẩu hiện tại:</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder={errors.currentPassword || ""} // dùng lỗi làm placeholder nếu có
              className={errors.currentPassword ? "input-error" : ""}
            />
          </div>

          <div className="form-row">
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder={errors.newPassword || ""} // dùng lỗi làm placeholder nếu có
              className={errors.newPassword ? "input-error" : ""}
            />
          </div>

          <div className="form-row">
            <label>Nhập lại mật khẩu mới:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={errors.confirmPassword || ""} // dùng lỗi làm placeholder nếu có
              className={errors.confirmPassword ? "input-error" : ""}
            />
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
