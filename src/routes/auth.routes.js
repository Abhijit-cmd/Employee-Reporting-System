const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// PUBLIC
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh", authController.refreshAccessToken);
router.post("/logout", authController.logoutUser);

// PROTECTED
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/employees", authMiddleware, authController.getAllEmployees);
router.delete("/employees/:id", authMiddleware, authController.deleteEmployee);

module.exports = router;
