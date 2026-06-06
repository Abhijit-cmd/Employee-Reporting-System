const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

router.post("/create", authMiddleware, reportController.createReport);
router.get("/my-reports", authMiddleware, reportController.getMyReports);

// Admin-only routes
router.get("/", authMiddleware, adminMiddleware, reportController.getReports);
router.put("/pending/:reportId", authMiddleware, adminMiddleware, reportController.markPending);
router.put("/reviewed/:reportId", authMiddleware, adminMiddleware, reportController.markReviewed);

module.exports = router;
