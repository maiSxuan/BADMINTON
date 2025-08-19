const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

let tempUsers = {}; // key = email, value = {userData, otp, expires}

const createToken = (user) => {
  const payload = {
    userID: user.userID,
    role: user.user_type,
  };
  return jwt.sign({ payload }, process.env.ACCESS_TOKEN, {
    expiresIn: "7d",
  });
};

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Send email error:", err.message);
    throw new Error("Không thể gửi email");
  }
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
    if (role === "ADMIN") {
      const newUser = await User.create({
        userID: uuidv4(),
        name,
        phone,
        address,
        email,
        password: hashed,
        user_type: role,
        isVerified: true, // luôn true
      });

      const token = createToken(newUser);
      return res.status(201).json({
        message: "Đăng ký ADMIN thành công",
        token,
        user: {
          userID: newUser.userID,
          email: newUser.email,
          phone: newUser.phone,
          name: newUser.name,
          user_type: newUser.user_type,
        },
      });
    }

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Lưu user tạm (chỉ trong RAM)
    tempUsers[email] = {
      userID: uuidv4(),
      name,
      phone,
      address,
      email,
      password: hashed,
      user_type: role,
      otp: hashedOtp,
      otpExpires: Date.now() + 60 * 1000, // 1 phút
    };

    // const newUser = await User.create({
    //   userID: uuidv4(),
    //   name,
    //   phone,
    //   address,
    //   email,
    //   password: hashed,
    //   user_type: role,
    //   isVerified: 0,
    // });

    //   const token = createToken(newUser);
    //   res.status(201).json({
    //     token,
    //     user: {
    //       userID: newUser.userID,
    //       email: newUser.email,
    //       phone: newUser.phone,
    //       name: newUser.name,
    //       user_type: newUser.user_type,
    //     },
    //   });
    // } catch (err) {
    //   console.error("REGISTER ERROR:", err);  // In lỗi chi tiết
    //   res.status(500).json({ message: "Lỗi máy chủ, thử lại sau.", error: err.message });
    // }
    //const otp = newUser.createVerifyEmailToken(); // Tạo mã OTP
    //await newUser.save({ validateBeforeSave: false });

    const message = `Mã xác minh tài khoản của bạn là: ${otp}. Mã có hiệu lực trong 1 phút.`;
    await sendEmail(email, "Xác minh đăng ký tài khoản", message);

    res.status(201).json({ message: "Mã xác minh đã được gửi qua email" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ, thử lại sau.", error: err.message });
  }
};

// Xác minh mã OTP sau đăng ký
exports.verifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    // const existingUser = await User.findOne({ email });
    // if (!existingUser) {
    //   return res.status(404).json({ message: "Tài khoản chưa được đăng ký" });
    // }

    const tempUser = tempUsers[email];
    if (!tempUser) {
      return res.status(400).json({
        message: "Không tìm thấy thông tin đăng ký, vui lòng thử lại",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (tempUser.otp !== hashedOtp || tempUser.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    // const user = await User.findOne({
    //   email,
    //   verifyEmailToken: hashedOtp,
    //   verifyEmailExpires: { $gt: Date.now() },
    // });

    // Tạo user thật trong DB
    const user = await User.create({
      userID: tempUser.userID,
      name: tempUser.name,
      phone: tempUser.phone,
      address: tempUser.address,
      email: tempUser.email,
      password: tempUser.password,
      user_type: tempUser.user_type,
      isVerified: 1,
    });

    // Xóa user tạm
    delete tempUsers[email];

    // if (!user) {
    //   return res
    //     .status(400)
    //     .json({ message: "Mã không hợp lệ hoặc đã hết hạn" });
    // }

    // user.isVerified = 1;
    // user.verifyEmailToken = undefined;
    // user.verifyEmailExpires = undefined;
    // await user.save();

    const token = createToken(user);
    res.status(200).json({
      message: "Xác minh thành công",
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
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Lỗi xác minh", error: err.message });
  }
};

// Đăng nhập bằng email hoặc phone
exports.login = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    const user = email
      ? await User.findOne({ email })
      : await User.findOne({ phone });

    if (!user) {
      return res.status(401).json({ message: "Tài khoản chưa được đăng ký" });
    }
    if (user.user_type !== "ADMIN" && !user.isVerified) {
      return res.status(403).json({ message: "Tài khoản chưa xác minh OTP" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = createToken(user);
    res.status(200).json({
      message: "Đăng nhập thành công",
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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    console.log("EMAIL_USER:", process.env.EMAIL_USER);

    // Tạo mã 6 số và lưu hashed vào DB
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const message = `Mã xác nhận đặt lại mật khẩu của bạn là: ${resetToken}. Mã có hiệu lực trong 1 phút`;
    await sendEmail(user.email, "Mã xác nhận đặt lại mật khẩu", message);

    res.status(200).json({ message: "Mã xác nhận đã được gửi qua email" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Lỗi gửi email", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Mã không hợp lệ hoặc đã hết hạn" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Lỗi đặt lại mật khẩu" });
  }
};
