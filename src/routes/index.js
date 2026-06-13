const express = require("express");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const authController = require("../controllers/auth.controller");
const employeesController = require("../controllers/admin/employees.controller");
const dashboardController = require("../controllers/admin/dashboard.controller");
const adminReportsController = require("../controllers/admin/reports.controller");
const targetsController = require("../controllers/admin/targets.controller");
const announcementController = require("../controllers/admin/announcement.controller");
const employeeReportController = require("../controllers/employee/report.controller");
const notifController = require("../controllers/employee/notification.controller");
const departmentsController = require("../controllers/admin/departments.controller");
const kpiTemplatesController = require("../controllers/admin/kpiTemplates.controller");
const adminAppraisalsController = require("../controllers/admin/appraisals.controller");
const employeeAppraisalController = require("../controllers/employee/appraisal.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const employeeMiddleware = require("../middleware/employee.middleware");
const loginLimiter = require("../middleware/loginLimiter.middleware");
const requirePermission = require("../middleware/permission.middleware");

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
  windowMs: 60 * 1000,
  max: 60,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── AUTH ──────────────────────────────────────────────────────────────────────
const authRouter = express.Router();
authRouter.use(authLimiter);

// authRouter.post("/register", authController.registerUser); // disabled — admin-only registration
authRouter.post("/login", loginLimiter, authController.loginUser);
authRouter.post("/refresh", authController.refreshAccessToken);
authRouter.post("/logout", authController.logoutUser);
authRouter.get("/profile", authMiddleware, authController.getProfile);

// ── REPORTS (employee only) ───────────────────────────────────────────────────
const reportsRouter = express.Router();
reportsRouter.use(authMiddleware, employeeMiddleware, apiLimiter);

reportsRouter.post("/create", employeeReportController.createReport);
reportsRouter.get("/my-reports", employeeReportController.getMyReports);
reportsRouter.get("/my-targets", employeeReportController.getMyTargets);
reportsRouter.patch("/my-targets/:id/achieve", employeeReportController.updateTargetAchieved);
reportsRouter.put("/change-password", employeeReportController.changePassword);
// IMPORTANT: specific routes must come BEFORE parameterised routes
reportsRouter.get("/:id", employeeReportController.getReportById);
reportsRouter.put("/:id", employeeReportController.updateReport);

// ── ADMIN ─────────────────────────────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.use(authMiddleware, adminMiddleware, apiLimiter);

adminRouter.get("/employees", employeesController.getAllEmployees);
adminRouter.post("/employees", employeesController.createEmployee);
adminRouter.put("/employees/:id", employeesController.updateEmployee);
adminRouter.delete("/employees/:id", employeesController.deleteEmployee);
adminRouter.get("/managers", requirePermission("managers.manage"), employeesController.getManagers);
adminRouter.post("/managers", requirePermission("managers.manage"), employeesController.createManager);
adminRouter.put("/managers/:id", requirePermission("managers.manage"), employeesController.updateManager);
adminRouter.delete("/managers/:id", requirePermission("managers.manage"), employeesController.deleteManager);
adminRouter.get("/leadership", requirePermission("managers.manage"), employeesController.getLeadership);
adminRouter.get("/targets", targetsController.getTargets);
adminRouter.post("/targets", targetsController.createTarget);
adminRouter.get("/analytics", dashboardController.getAnalytics);
adminRouter.get("/dashboard/summary", dashboardController.getDashboardSummary);
adminRouter.get("/dashboard/target-achievements", dashboardController.getEmployeeTargetAchievements);
adminRouter.get("/employees/:id/reports", adminReportsController.getEmployeeReports);
adminRouter.get("/reports", adminReportsController.getAllReports);
// IMPORTANT: specific routes must come BEFORE parameterised routes
adminRouter.get("/reports/download/all", adminReportsController.downloadAllReports);
adminRouter.get("/reports/not-submitted", adminReportsController.getNotSubmitted);
adminRouter.post("/reports/remind", adminReportsController.sendReminder);
adminRouter.put("/reports/pending/:reportId", adminReportsController.markPending);
adminRouter.put("/reports/reviewed/:reportId", adminReportsController.markReviewed);
adminRouter.get("/reports/:id", adminReportsController.getReportById);
adminRouter.get("/reports/:id/download", adminReportsController.downloadReport);

// ── DEPARTMENTS ───────────────────────────────────────────────────────────────
adminRouter.get("/departments", departmentsController.getDepartments);
adminRouter.post("/departments", requirePermission("departments.manage"), departmentsController.createDepartment);
adminRouter.put("/departments/:id", requirePermission("departments.manage"), departmentsController.updateDepartment);
adminRouter.delete("/departments/:id", requirePermission("departments.manage"), departmentsController.deleteDepartment);

// ── KPI TEMPLATES ─────────────────────────────────────────────────────────────
adminRouter.get("/kpi-templates", kpiTemplatesController.getKpiTemplates);
adminRouter.post("/kpi-templates", requirePermission("kpi_templates.manage"), kpiTemplatesController.createKpiTemplate);
adminRouter.put("/kpi-templates/:id", requirePermission("kpi_templates.manage"), kpiTemplatesController.updateKpiTemplate);
adminRouter.delete("/kpi-templates/:id", requirePermission("kpi_templates.manage"), kpiTemplatesController.deleteKpiTemplate);

// ── APPRAISALS (rater side) ───────────────────────────────────────────────────
// IMPORTANT: specific routes must come BEFORE the /appraisals/:id parameterised route
adminRouter.get("/appraisals/raisable", adminAppraisalsController.getRaisableUsers);
adminRouter.get("/appraisals/raised", adminAppraisalsController.getRaisedAppraisals);
adminRouter.get("/appraisals/kpi-templates/:userId", adminAppraisalsController.getKpiTemplatesForUser);
adminRouter.post("/appraisals", adminAppraisalsController.raiseAppraisal);
adminRouter.get("/appraisals/:id", adminAppraisalsController.getAppraisalById);

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
const announcementsRouter = express.Router();
announcementsRouter.use(authMiddleware, apiLimiter);

announcementsRouter.get("/", announcementController.getAnnouncements);
announcementsRouter.post("/", adminMiddleware, announcementController.createAnnouncement);
announcementsRouter.delete("/:id", adminMiddleware, announcementController.deleteAnnouncement);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
const notificationsRouter = express.Router();
notificationsRouter.use(authMiddleware, apiLimiter);

notificationsRouter.get("/", notifController.getNotifications);
notificationsRouter.patch("/read-all", notifController.markAllRead);

// ── APPRAISALS (raisee side) ──────────────────────────────────────────────────
const appraisalsRouter = express.Router();
appraisalsRouter.use(authMiddleware, apiLimiter);

appraisalsRouter.get("/my", employeeAppraisalController.getMyAppraisals);
appraisalsRouter.get("/my/:id", employeeAppraisalController.getMyAppraisalById);
appraisalsRouter.patch("/my/:id/acknowledge", employeeAppraisalController.acknowledgeAppraisal);
appraisalsRouter.patch("/my/:id/self-assessment", employeeAppraisalController.updateMySelfAssessment);

// ── Mount ─────────────────────────────────────────────────────────────────────
const router = express.Router();
router.use("/auth", authRouter);
router.use("/reports", reportsRouter);
router.use("/admin/announcements", announcementsRouter);
router.use("/admin", adminRouter);
router.use("/notifications", notificationsRouter);
router.use("/appraisals", appraisalsRouter);

module.exports = router;
