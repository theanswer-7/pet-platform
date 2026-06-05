const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// 使用箭头函数
router.get("/users", (req, res) => authController.getAllUsers(req, res));
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/profile", authenticate, (req, res) => authController.getProfile(req, res));
router.put("/profile", authenticate, (req, res) => authController.updateProfile(req, res));

module.exports = router;
