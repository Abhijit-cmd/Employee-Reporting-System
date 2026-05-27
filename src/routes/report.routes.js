const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/auth.middleware");

const reportController =
  require("../controllers/report.controller");

// CREATE REPORT
router.post(
  "/create",
  authMiddleware,
  reportController.createReport
);


// // GET ALL REPORTS
router.get(
  "/",
  authMiddleware,
  reportController.getReports
);

router.get(
  "/my-reports",
  authMiddleware,
  reportController.getMyReports
);
module.exports = router;