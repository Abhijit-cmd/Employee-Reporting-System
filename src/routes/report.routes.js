const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/create", authMiddleware, reportController.createReport);
router.get("/", authMiddleware, reportController.getReports);
router.get("/my-reports", authMiddleware, reportController.getMyReports);
router.put("/pending/:reportId", authMiddleware, reportController.markPending);
router.put("/reviewed/:reportId", authMiddleware, reportController.markReviewed);

module.exports = router;
