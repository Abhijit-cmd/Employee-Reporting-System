const express = require("express");
const router = express.Router();
const notifController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, notifController.getNotifications);
router.patch("/read-all", authMiddleware, notifController.markAllRead);

module.exports = router;
