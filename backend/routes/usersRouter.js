const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

router.post("/create", authenticate, authorizeRole("ADMIN"), userController.createUser);
router.get("/user-list",  authenticate, authorizeRole("ADMIN"), userController.getAllUsers);
router.patch("/status/:id", authenticate, authorizeRole("ADMIN"), userController.toggleUserStatus);
router.delete("/:id", authenticate, authorizeRole("ADMIN"), userController.deleteUser);

router.get("/profile", authenticate, userController.getUserProfile);
router.put("/profile", authenticate, userController.updateUserProfile);

module.exports = router;
