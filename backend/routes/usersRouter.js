const express = require ('express')
const router=  express.Router()
const User = require('../models/UserModel')
const authMiddleware = require('../middlewares/authMiddleware'); // xác thực JWT
const roleMiddleware = require('../middlewares/roleMiddleware');


router.get("/", authMiddleware, roleMiddleware("ADMIN"), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Xóa người dùng thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
  }
});

router.patch("/:id", authMiddleware, roleMiddleware("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.isLock = !user.isLock;
    await user.save();

    res.json({ message: "Cập nhật thành công", isLock: user.isLock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router

