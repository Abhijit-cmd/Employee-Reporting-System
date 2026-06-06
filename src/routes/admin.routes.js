const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

router.get("/profile", authMiddleware, adminMiddleware, adminController.getAdminProfile);
router.get("/reports", authMiddleware, adminMiddleware, adminController.getAllReports);
// IMPORTANT: specific routes must come BEFORE parameterised routes
router.get("/reports/download/all", authMiddleware, adminMiddleware, adminController.downloadAllReports);
router.get("/reports/:id", authMiddleware, adminMiddleware, adminController.getReportById);
router.get("/reports/:id/download", authMiddleware, adminMiddleware, adminController.downloadReport);

module.exports = router;