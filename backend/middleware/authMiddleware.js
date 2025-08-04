// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const User = require('../models/UserModel');
// dotenv.config()

// const genneralAccessToken = async (payload) => {
//   const access_token = jwt.sign({
//     payload
//   }, process.env.ACCESS_TOKEN, { expiresIn: '1h'})

//   return access_token
// }

// const genneralRefreshToken = async(payload) => {
//   const refresh_token = jwt.sign({
//     payload
//   }, process.env.REFRESH_TOKEN, { expiresIn: '365d'})

//   return refresh_token
// }

// const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token, access denied" });
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token || token === "null") {
//       return res.status(401).json({ message: "No token provided" });
//     }
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
//     const userId = decoded.payload.userID;       // lấy từ payload
//     const role = decoded.payload.role;      

//     const user = await User.findOne({ userID: userId}).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.status === 0) return res.status(403).json({ message: "Account locked" });

//     req.user = user;
//     req.user.role = role;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token", error: err.message });
//   }
// };

// const isAdmin = (req, res, next) => {
//   try {
//     if (!req.user || req.user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Access denied: Admin only" });
//     }
//     next();
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// module.exports = {
//   genneralAccessToken,
//   genneralRefreshToken,
//   authenticate,
//   isAdmin
// }
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
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

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const token = authHeader.split(" ")[1];
    if (!token || token === "null") {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.payload.userID;  
    const role = decoded.payload.role;      

    const user = await User.findOne({ userID: userId}).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === 0) return res.status(403).json({ message: "Account locked" });

    req.user = user;
    req.user.role = role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

const authorizeRole = (requireRole) =>{
  return (req, res, next) => {
    try{
      if(!req.user){
        return res.status(401).json({message: 'unauthorized'});
      }

      if(req.user.role != requireRole){
        return res.status(403).json({message: `Access denied :${requireRole} only`});
      }

      next();
    } catch(err){
      return res.status(500).json({message: "server error", error: err.message});
    }
  };
};

module.exports = {
  genneralAccessToken,
  genneralRefreshToken,
  authenticate,
  authorizeRole
}