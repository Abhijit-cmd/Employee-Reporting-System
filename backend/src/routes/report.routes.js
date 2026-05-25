const express = require("express");

const router = express.Router();

const {
  createReport,
  getReports,
} = require("../controllers/report.controller");

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
// router.get(
//   "/",
//   authMiddleware,
//   getReports
// );

module.exports = router;