const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const authMiddleware = require('../middleware/authMiddleware')


exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, gender, date_of_birth, address, password, user_type } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      gender,
      date_of_birth,
      address,
      password: hashedPassword,
      user_type
    });

    await newUser.save();
    res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // không trả password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};