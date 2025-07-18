const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      const user = req.user; // req.user được gắn từ authMiddleware

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next(); // Cho phép truy cập
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = roleMiddleware;
