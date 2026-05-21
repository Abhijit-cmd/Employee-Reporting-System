const express = require("express");

const router = express.Router();

const {

  createReport,
  getReports

} = require("../controllers/report.controller");


// CREATE REPORT
router.post("/create", createReport);


// GET ALL REPORTS
router.get("/", getReports);


module.exports = router;