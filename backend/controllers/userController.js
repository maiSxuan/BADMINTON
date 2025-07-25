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

//từng ng
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID }).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.userID }); 
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const { name, email, phone, gender, date_of_birth, address, currentPassword, newPassword } = req.body;

    // Đổi mật khẩu
     if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email đã tồn tại" });
      user.email = email;
    }
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
      user.phone = phone;
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Cập nhật thông tin khác
    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (address) user.address = address;

    await user.save();

    const updatedUser = await User.findOne({ userID: req.user.userID }).select("-password");
    res.json({ message: "Cập nhật thông tin thành công", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err); // log lỗi
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};