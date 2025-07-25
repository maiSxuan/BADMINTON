const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware.authenticate, authMiddleware.isAdmin, userController.createUser);
router.get("/user-list",  authMiddleware.authenticate, authMiddleware.isAdmin, userController.getAllUsers);
router.patch("/status/:id", authMiddleware.authenticate, authMiddleware.isAdmin, userController.toggleUserStatus);
router.delete("/:id", authMiddleware.authenticate, authMiddleware.isAdmin, userController.deleteUser);

router.get("/profile", authMiddleware.authenticate, userController.getUserProfile);
router.put("/profile", authMiddleware.authenticate, userController.updateUserProfile);

module.exports = router;
