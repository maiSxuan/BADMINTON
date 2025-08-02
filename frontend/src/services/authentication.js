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