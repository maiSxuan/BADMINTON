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

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.status = user.status === 1 ? 0 : 1;
    await user.save();

    res.json({ message: "Cập nhật trạng thái thành công", status: user.status });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};