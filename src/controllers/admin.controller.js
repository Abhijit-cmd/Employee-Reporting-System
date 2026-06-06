const prisma = require("../prisma/prismaClient");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");

// Helper function for standard API responses
const successResponse = (res, data, status = 200) => {
  return res.status(status).json({ success: true, data });
};

const errorResponse = (res, message, status = 500) => {
  return res.status(status).json({ success: false, message });
};

exports.getAnalytics = async (req, res) => {
  try {
    const [reports, totalEmployees, targets] = await Promise.all([
      prisma.report.findMany({
        include: {
          user: { select: { name: true, employeeId: true } },
          reportStatus: true,
        },
        orderBy: { mmyyyy: "asc" },
      }),
      prisma.user.count({ where: { role: { roleName: "Employee" } } }),
      prisma.target.findMany({
        include: { employee: { select: { name: true } } },
      }),
    ]);

    // Monthly trend grouped by mmyyyy
    const monthlyMap = new Map();
    for (const r of reports) {
      if (!monthlyMap.has(r.mmyyyy)) {
        monthlyMap.set(r.mmyyyy, { month: r.mmyyyy, total: 0, reviewed: 0, pending: 0, submitted: 0 });
      }
      const entry = monthlyMap.get(r.mmyyyy);
      entry.total++;
      const s = r.reportStatus?.statusName ?? "";
      if (s === "Reviewed") entry.reviewed++;
      else if (s === "Pending") entry.pending++;
      else if (s === "Submitted") entry.submitted++;
    }
    const monthlyTrend = Array.from(monthlyMap.values());

    // Reports by employee
    const empMap = new Map();
    for (const r of reports) {
      const name = r.user?.name ?? "Unknown";
      empMap.set(name, (empMap.get(name) ?? 0) + 1);
    }
    const byEmployee = Array.from(empMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Status distribution
    const statusMap = new Map();
    for (const r of reports) {
      const s = r.reportStatus?.statusName ?? "Unknown";
      statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
    }
    const byStatus = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    // Target achievement
    const targetData = targets.map((t) => ({
      name: t.employee?.name ?? "Unknown",
      target: t.targetValue,
      achieved: t.achievedValue,
    }));

    return successResponse(res, {
      totalReports: reports.length,
      totalEmployees,
      monthlyTrend,
      byEmployee,
      byStatus,
      targetData,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch analytics");
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    // Use Promise.all for parallel queries
    const [totalEmployees, totalReports, reportsByStatus] = await Promise.all([
      // Count total employees (with Employee role)
      prisma.user.count({
        where: {
          role: { roleName: "Employee" },
        },
      }),
      // Count total reports
      prisma.report.count(),
      // Get count of reports by status
      prisma.reportStatus.findMany({
        include: {
          _count: {
            select: { reports: true },
          },
        },
      }),
    ]);

    // Transform the status data for easy use
    const statusMap = new Map();
    reportsByStatus.forEach(status => {
      statusMap.set(status.statusName, status._count.reports);
    });

    const submittedReports = statusMap.get("Submitted") || 0;
    const pendingReports = statusMap.get("Pending") || 0;

    return successResponse(res, {
      totalEmployees,
      totalReports,
      submittedReports,
      pendingReports,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch dashboard summary");
  }
};

exports.getEmployeeTargetAchievements = async (req, res) => {
  try {
    // Fetch targets with employee data and calculate achieved
    const targets = await prisma.target.findMany({
      include: {
        employee: { select: { name: true } },
      },
    });

    // Transform the data to what the frontend needs
    const data = targets.map(target => ({
      employeeName: target.employee?.name ?? 'Unknown',
      targetValue: target.targetValue,
      achievedValue: target.achievedValue,
    }));

    return successResponse(res, data);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch target achievements");
  }
};

exports.getReportById = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (isNaN(reportId)) return errorResponse(res, "Invalid report ID", 400);
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: { select: { id: true, name: true, employeeId: true, email: true } },
        reportStatus: true,
      },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }
    return successResponse(res, report);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch report");
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        include: {
          user: { select: { id: true, name: true, employeeId: true, email: true } },
          reportStatus: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.report.count(),
    ]);

    return successResponse(res, {
      reports,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch reports");
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (isNaN(reportId)) return errorResponse(res, "Invalid report ID", 400);
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        reportStatus: true,
      },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    const format = (req.query.format || "pdf").toLowerCase();
    if (format === "xlsx") {
      const rows = [
        ["Field", "Value"],
        ["Employee Name", report.user?.name ?? ""],
        ["Employee ID", report.user?.employeeId ?? ""],
        ["Month", report.mmyyyy],
        ["Business Owner", report.businessOwner],
        ["Prepared By", report.preparedBy],
        ["Reviewed By", report.reviewedBy],
        ["Status", report.reportStatus?.statusName ?? ""],
        ["Customers Registered", report.customersRegistered],
        ["Suppliers Registered", report.suppliersRegistered],
        ["New Brand Products", report.newBrandProducts],
        ["Success Stories", report.successStories],
        ["Website Visitors", report.websiteVisitors],
        ["Challenges", report.challenges ?? ""],
        ["Sales Booking", report.salesBooking ?? ""],
        ["Target Vs Achievement", report.targetVsAchievement ?? ""],
        ["Accomplishments", report.accomplishments ?? ""],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 28 }, { wch: 60 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.xlsx"`);
      return res.send(buf);
    }

    const doc = new PDFDocument();
    const fileName = `report-${report.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.on("error", (err) => { console.error("PDF error:", err); res.destroy(); });
    doc.pipe(res);
    // TITLE
    doc.fontSize(20).text("Monthly Report", { align: "center" });
    doc.moveDown();

    // EMPLOYEE DETAILS
    doc.fontSize(14);
    doc.text(`Employee Name: ${report.user?.name}`);
    doc.text(`Employee ID: ${report.user?.employeeId}`);
    doc.text(`Month: ${report.mmyyyy}`);
    doc.text(`Business Owner: ${report.businessOwner}`);
    doc.text(`Prepared By: ${report.preparedBy}`);
    doc.text(`Reviewed By: ${report.reviewedBy}`);
    doc.text(`Status: ${report.reportStatus?.statusName}`);
    doc.moveDown();

    // SECTION 1
    doc.fontSize(16).text("Overview");
    doc.fontSize(12);
    doc.text(`Customers Registered: ${report.customersRegistered}`);
    doc.text(`Suppliers Registered: ${report.suppliersRegistered}`);
    doc.text(`New Brand Products: ${report.newBrandProducts}`);
    doc.text(`Success Stories: ${report.successStories}`);
    doc.text(`Website Visitors: ${report.websiteVisitors}`);
    doc.moveDown();

    // SECTION 2
    doc.fontSize(16).text("Challenges");
    doc.fontSize(12).text(report.challenges || "");
    doc.moveDown();

    // SECTION 3
    doc.fontSize(16).text("Sales Booking");
    doc.fontSize(12).text(report.salesBooking || "");
    doc.moveDown();

    // SECTION 4
    doc.fontSize(16).text("Target Vs Achievement");
    doc.fontSize(12).text(report.targetVsAchievement || "");
    doc.moveDown();

    // SECTION 5
    doc.fontSize(16).text("Accomplishments");
    doc.fontSize(12).text(report.accomplishments || "");
    doc.end();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to download report");
  }
};

exports.downloadAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        reportStatus: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const format = (req.query.format || "pdf").toLowerCase();
    if (format === "xlsx") {
      const headers = [
        "Employee Name", "Employee ID", "Month", "Business Owner",
        "Prepared By", "Reviewed By", "Status",
        "Customers Registered", "Suppliers Registered", "New Brand Products",
        "Success Stories", "Website Visitors",
        "Challenges", "Sales Booking", "Target Vs Achievement", "Accomplishments",
      ];
      const rows = reports.map(r => [
        r.user?.name ?? "",
        r.user?.employeeId ?? "",
        r.mmyyyy,
        r.businessOwner,
        r.preparedBy,
        r.reviewedBy,
        r.reportStatus?.statusName ?? "",
        r.customersRegistered,
        r.suppliersRegistered,
        r.newBrandProducts,
        r.successStories,
        r.websiteVisitors,
        r.challenges ?? "",
        r.salesBooking ?? "",
        r.targetVsAchievement ?? "",
        r.accomplishments ?? "",
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = headers.map((_, i) => ({ wch: i >= 12 ? 40 : 20 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "All Reports");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="all-reports.xlsx"');
      return res.send(buf);
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="all-reports.pdf"');
    doc.on("error", (err) => { console.error("PDF error:", err); res.destroy(); });
    doc.pipe(res);

    // TITLE
    doc.fontSize(22).text("All Employee Reports", { align: "center" });
    doc.moveDown(2);
    reports.forEach((report, index) => {
      doc.fontSize(18).text(`Report ${index + 1}`, { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Employee Name: ${report.user?.name}`);
      doc.text(`Employee ID: ${report.user?.employeeId}`);
      doc.text(`Month: ${report.mmyyyy}`);
      doc.text(`Business Owner: ${report.businessOwner}`);
      doc.text(`Prepared By: ${report.preparedBy}`);
      doc.text(`Reviewed By: ${report.reviewedBy}`);
      doc.text(`Status: ${report.reportStatus?.statusName}`);
      doc.moveDown();

      doc.text(`Customers Registered: ${report.customersRegistered}`);
      doc.text(`Suppliers Registered: ${report.suppliersRegistered}`);
      doc.text(`New Brand Products: ${report.newBrandProducts}`);
      doc.text(`Success Stories: ${report.successStories}`);
      doc.text(`Website Visitors: ${report.websiteVisitors}`);
      doc.moveDown();

      doc.text("Challenges:");
      doc.text(report.challenges || "");
      doc.moveDown();

      doc.text("Sales Booking:");
      doc.text(report.salesBooking || "");
      doc.moveDown();

      doc.text("Target Vs Achievement:");
      doc.text(report.targetVsAchievement || "");
      doc.moveDown();

      doc.text("Accomplishments:");
      doc.text(report.accomplishments || "");

      // NEXT PAGE
      if (index !== reports.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to download reports");
  }
};

exports.getEmployeeReports = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return errorResponse(res, "Invalid employee ID", 400);

    const [employee, reports] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, employeeId: true, email: true },
      }),
      prisma.report.findMany({
        where: { userId },
        include: { reportStatus: true },
        orderBy: { mmyyyy: "desc" },
      }),
    ]);

    if (!employee) return errorResponse(res, "Employee not found", 404);

    return successResponse(res, { employee, reports });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch employee reports");
  }
};

exports.sendReminder = async (req, res) => {
  try {
    const { userId, month } = req.body;
    if (!userId || !month) return errorResponse(res, "userId and month are required", 400);

    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { id: true, name: true } });
    if (!user) return errorResponse(res, "Employee not found", 404);

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Report Submission Reminder",
        message: `Please submit your monthly report for ${month}. Your report is overdue — submit it as soon as possible.`,
        notificationType: "reminder",
      },
    });

    return successResponse(res, { message: "Reminder sent to " + user.name });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to send reminder");
  }
};

exports.getNotSubmitted = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^(0[1-9]|1[0-2])\d{4}$/.test(month)) {
      return errorResponse(res, "Invalid month. Use MMYYYY format.", 400);
    }

    const [allEmployees, reports] = await Promise.all([
      prisma.user.findMany({
        where: { role: { roleName: "Employee" } },
        select: { id: true, name: true, employeeId: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.report.findMany({
        where: { mmyyyy: month },
        select: { userId: true },
      }),
    ]);

    const submittedIds = new Set(reports.map(r => r.userId));
    const notSubmitted = allEmployees.filter(e => !submittedIds.has(e.id));

    return successResponse(res, { month, notSubmitted, total: notSubmitted.length });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch not-submitted employees");
  }
};
