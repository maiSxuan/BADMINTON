const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const genneralAccessToken = async (payload) => {
  const access_token = jwt.sign({
    payload
  }, process.env.ACCESS_TOKEN, { expiresIn: '1h'})

  return access_token
}

const genneralRefreshToken = async(payload) => {
  const refresh_token = jwt.sign({
    payload
  }, process.env.REFRESH_TOKEN, { expiresIn: '365d'})

  return refresh_token
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token)
      return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role, 
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = {
  genneralAccessToken,
  genneralRefreshToken,
  verifyToken
}