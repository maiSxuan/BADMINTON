export const getProfile = async (token) => {
  const res = await fetch("http://localhost:4000/api/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
  return await res.json();
};

export const updateProfile = async (token, payload) => {
  const res = await fetch("http://localhost:4000/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Cập nhật thất bại");
  }

  return await res.json();
};

export const getAllUsers = async (token) => {
  const res = await fetch('http://localhost:4000/api/users/user-list', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
  return await res.json();
};

export const deleteUser = async (id, token) => {
  const res = await fetch(`http://localhost:4000/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Không thể xóa người dùng");
  }
  return await res.json();
};

export const toggleUserStatus = async (id, token) => {
  const res = await fetch(`http://localhost:4000/api/users/status/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Không thể cập nhật trạng thái");
  }
  return await res.json();
};

export const loginUser = async (emailOrPhone, password) => {
  const isEmail = emailOrPhone.includes("@");
  const loginType = isEmail ? "email" : "phone";

  const res = await fetch(`http://localhost:4000/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [loginType]: emailOrPhone, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Đăng nhập thất bại");
  }
  return await res.json(); // { token, user }
};

export const registerUser = async (data) => {
  const res = await fetch(`http://localhost:4000/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    const err = new Error(errorData.message || "Đăng ký thất bại");
    err.response = { data: errorData }; // thêm field như axios
    throw err;
  }

  return await res.json();
};