const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const loginLimiter =require("../middleware/loginLimiter.middleware");

// PUBLIC
router.post("/register", authController.registerUser);
router.post("/login", loginLimiter, authController.loginUser);
router.post("/refresh", authController.refreshAccessToken);
router.post("/logout", authController.logoutUser);

// PROTECTED
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/employees", authMiddleware, adminMiddleware, authController.getAllEmployees);
router.put("/employees/:id", authMiddleware, adminMiddleware, authController.updateEmployee);
router.delete("/employees/:id", authMiddleware, adminMiddleware, authController.deleteEmployee);

module.exports = router;
