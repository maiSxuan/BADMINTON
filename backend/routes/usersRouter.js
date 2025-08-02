const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/",  authMiddleware.authenticate, authMiddleware.authorizeRole("ADMIN"), userController.getAllUsers);
router.patch("/status/:id", authMiddleware.authenticate, authMiddleware.authorizeRole("ADMIN"), userController.toggleUserStatus);
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorizeRole("ADMIN"), userController.deleteUser);

router.get("/profile", authMiddleware.authenticate, authMiddleware.authorizeRole("USER"), userController.getUserProfile);
router.put("/profile", authMiddleware.authenticate, authMiddleware.authorizeRole("USER"), userController.updateUserProfile);
router.get("/admin-profile", authMiddleware.authenticate, authMiddleware.authorizeRole("ADMIN"), userController.getUserProfile);

module.exports = router;
