const express = require("express");

const router = express.Router();

const authController =
  require("../controllers/auth.controller");

const authMiddleware =
  require("../middleware/auth.middleware");

// REGISTER
router.post(
  "/register",
  authController.registerUser
);

// LOGIN
router.post(
  "/login",
  authController.loginUser
);

// PROFILE
router.get(
  "/profile",
  authMiddleware,
  authController.getProfile
);

router.get(
  "/employees",
  authMiddleware,
  authController.getAllEmployees
);
module.exports = router;