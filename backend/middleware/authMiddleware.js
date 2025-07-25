const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/UserModel');
dotenv.config()

const genneralAccessToken = async (payload) => {
  const access_token = jwt.sign({
    payload
  }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })

  return access_token
}

const genneralRefreshToken = async (payload) => {
  const refresh_token = jwt.sign({
    payload
  }, process.env.REFRESH_TOKEN, { expiresIn: '365d' })

  return refresh_token
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.payload.userID;

    const user = await User.findOne({ userID: userId }).select("-password");
    if (!user || user.status === 0) {
      return res.status(403).json({ message: "Invalid or locked account" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};


module.exports = {
  genneralAccessToken,
  genneralRefreshToken,
  authenticate
}