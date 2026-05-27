const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const adminController = require("../controllers/admin.controller");

// all admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// download/all MUST come before /:id or Express matches "download" as the id
router.get("/reports/download/all", adminController.downloadAllReports);
router.get("/reports/:id/download", adminController.downloadReport);
router.get("/reports/:id", adminController.getReportById);

module.exports = router;
