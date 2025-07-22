const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/create", userController.createUser);
router.get("/user-list", userController.getAllUsers);
router.patch("/status/:id", userController.toggleUserStatus);
router.delete("/:id", userController.deleteUser);
module.exports = router;
