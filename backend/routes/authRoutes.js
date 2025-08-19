const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/verify-email", authController.verifyRegisterOtp); ///
router.post("/forgot-password", authController.forgotPassword);
router.post("/recover-password", authController.resetPassword);
module.exports = router;

//gọi authrole, authMiddle