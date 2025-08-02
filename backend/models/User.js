const mongoose = require('mongoose');
const {v4 : uuidv4} = require("uuid");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },

  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['nam', 'nữ', 'khác'], // hoặc để tự do nếu bạn muốn
    lowercase: true,
  },
  date_of_birth: {
    type: Date,
  },
  address: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 1, // 1 = hoạt động, 0 = khóa, tùy hệ thống
  },
  user_type: {
    type: String,
    enum: ['ADMIN', 'USER', 'GUEST'],
    default: 'USER',
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: { createdAt: 'create_at', updatedAt: 'update_at' } });

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 60 * 1000;

  return resetToken;
}

module.exports = mongoose.model('User', userSchema);
