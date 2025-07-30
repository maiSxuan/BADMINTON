const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const createToken = (user) => {
  const payload = { 
    userID: user.userID, 
    role: user.user_type, 
  };
  return jwt.sign({ payload }, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });
};

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, phone, address, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ field: "email", message: "Email đã tồn tại" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ field: "phone", message: "Số điện thoại đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const role = email.endsWith("@admin.com") ? "ADMIN" : "USER";
    const newUser = await User.create({
      userID: uuidv4(),
      name,
      phone,
      address,
      email,
      password: hashed,
      user_type: role
    });

    const token = createToken(newUser);
    res.status(201).json({
      token,
      user: {
        userID: newUser.userID,
        email: newUser.email,
        phone: newUser.phone,
        fullName: newUser.name,
        user_type: newUser.user_type,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ, thử lại sau." });
  }
};

// Đăng nhập bằng email hoặc phone
exports.login = async (req, res) => {
  const { email, phone, password } = req.body;
  
  try {
    let user;

    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    } else {
      return res.status(400).json({ message: "Vui lòng nhập email hoặc số điện thoại" });
    }

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = createToken(user);
    res.json({
      token,
      user: {
        userID: user.userID,
        email: user.email,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Đăng nhập thất bại", error: err.message });
  }
};