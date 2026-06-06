const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const targetsController = require("../controllers/targets.controller");
const announcementController = require("../controllers/announcement.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const reportController = require("../controllers/report.controller");



router.get("/targets", authMiddleware, adminMiddleware, targetsController.getTargets);
router.post("/targets", authMiddleware, adminMiddleware, targetsController.createTarget);
router.get("/analytics", authMiddleware, adminMiddleware, adminController.getAnalytics);
router.get("/dashboard/summary", authMiddleware, adminMiddleware, adminController.getDashboardSummary);
router.get("/dashboard/target-achievements", authMiddleware, adminMiddleware, adminController.getEmployeeTargetAchievements);
router.get("/reports",authMiddleware,adminMiddleware,adminController.getAllReports);
router.get("/employees/:id/reports", authMiddleware, adminMiddleware, adminController.getEmployeeReports);
// IMPORTANT: specific routes must come BEFORE parameterised routes
router.get("/reports/download/all", authMiddleware, adminMiddleware, adminController.downloadAllReports);
router.get("/reports/not-submitted", authMiddleware, adminMiddleware, adminController.getNotSubmitted);
router.post("/reports/remind", authMiddleware, adminMiddleware, adminController.sendReminder);
router.get("/reports/:id", authMiddleware, adminMiddleware, adminController.getReportById);
router.get("/reports/:id/download", authMiddleware, adminMiddleware, adminController.downloadReport);

// Announcements (admin manage, all employees read)
router.get("/announcements", authMiddleware, announcementController.getAnnouncements);
router.post("/announcements", authMiddleware, adminMiddleware, announcementController.createAnnouncement);
router.delete("/announcements/:id", authMiddleware, adminMiddleware, announcementController.deleteAnnouncement);

module.exports = router;
