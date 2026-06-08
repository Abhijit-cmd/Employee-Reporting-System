const prisma = require("../../prisma/prismaClient");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

const successResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const errorResponse = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

exports.getReports = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const reports = await prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, employeeId: true, email: true } },
        reportStatus: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const totalReports = await prisma.report.count();
    res.status(200).json({ reports, page, limit, totalReports, totalPages: Math.ceil(totalReports / limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
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

    return successResponse(res, { reports, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return errorResponse(res, "Failed to fetch reports");
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

    if (!report) return errorResponse(res, "Report not found", 404);
    return successResponse(res, report);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch report");
  }
};

exports.markPending = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    if (isNaN(reportId)) return res.status(400).json({ message: "Invalid report ID" });

    const pendingStatus = await prisma.reportStatus.findFirst({ where: { statusName: "Pending" } });
    if (!pendingStatus) return res.status(500).json({ message: "Pending status not found" });

    const existing = await prisma.report.findUnique({ where: { id: reportId } });
    if (!existing) return res.status(404).json({ message: "Report not found" });

    await prisma.report.update({
      where: { id: reportId },
      data: { reportStatus: { connect: { id: pendingStatus.id } } },
    });

    await prisma.notification.create({
      data: {
        userId: existing.userId,
        title: "Report Needs Attention",
        message: `Your report for ${existing.mmyyyy} has been marked as Pending. Please review and resubmit.`,
        notificationType: "pending",
      },
    }).catch(() => {});

    res.status(200).json({ message: "Report marked as Pending" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update report status" });
  }
};

exports.markReviewed = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    if (isNaN(reportId)) return res.status(400).json({ message: "Invalid report ID" });

    const reviewedStatus = await prisma.reportStatus.findFirst({ where: { statusName: "Reviewed" } });
    if (!reviewedStatus) return res.status(500).json({ message: "Reviewed status not found" });

    const existing = await prisma.report.findUnique({ where: { id: reportId } });
    if (!existing) return res.status(404).json({ message: "Report not found" });

    await prisma.report.update({
      where: { id: reportId },
      data: { reportStatus: { connect: { id: reviewedStatus.id } } },
    });

    await prisma.notification.create({
      data: {
        userId: existing.userId,
        title: "Report Reviewed",
        message: `Your report for ${existing.mmyyyy} has been reviewed and approved by admin.`,
        notificationType: "reviewed",
      },
    }).catch(() => {});

    res.status(200).json({ message: "Report marked as Reviewed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update report status" });
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

    const submittedIds = new Set(reports.map((r) => r.userId));
    const notSubmitted = allEmployees.filter((e) => !submittedIds.has(e.id));

    return successResponse(res, { month, notSubmitted, total: notSubmitted.length });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch not-submitted employees");
  }
};

exports.sendReminder = async (req, res) => {
  try {
    const { userId, month } = req.body;
    if (!userId || !month) return errorResponse(res, "userId and month are required", 400);

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true },
    });
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

    if (!report) return errorResponse(res, "Report not found", 404);

    const format = (req.query.format || "pdf").toLowerCase();
    if (format === "xlsx") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");
      ws.columns = [{ width: 28 }, { width: 60 }];
      ws.addRows([
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
      ]);
      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.xlsx"`);
      return res.send(Buffer.from(buf));
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.pdf"`);
    doc.on("error", (err) => { console.error("PDF error:", err); res.destroy(); });
    doc.pipe(res);
    doc.fontSize(20).text("Monthly Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14);
    doc.text(`Employee Name: ${report.user?.name}`);
    doc.text(`Employee ID: ${report.user?.employeeId}`);
    doc.text(`Month: ${report.mmyyyy}`);
    doc.text(`Business Owner: ${report.businessOwner}`);
    doc.text(`Prepared By: ${report.preparedBy}`);
    doc.text(`Reviewed By: ${report.reviewedBy}`);
    doc.text(`Status: ${report.reportStatus?.statusName}`);
    doc.moveDown();
    doc.fontSize(16).text("Overview");
    doc.fontSize(12);
    doc.text(`Customers Registered: ${report.customersRegistered}`);
    doc.text(`Suppliers Registered: ${report.suppliersRegistered}`);
    doc.text(`New Brand Products: ${report.newBrandProducts}`);
    doc.text(`Success Stories: ${report.successStories}`);
    doc.text(`Website Visitors: ${report.websiteVisitors}`);
    doc.moveDown();
    doc.fontSize(16).text("Challenges");
    doc.fontSize(12).text(report.challenges || "");
    doc.moveDown();
    doc.fontSize(16).text("Sales Booking");
    doc.fontSize(12).text(report.salesBooking || "");
    doc.moveDown();
    doc.fontSize(16).text("Target Vs Achievement");
    doc.fontSize(12).text(report.targetVsAchievement || "");
    doc.moveDown();
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
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("All Reports");
      ws.columns = headers.map((_, i) => ({ width: i >= 12 ? 40 : 20 }));
      ws.addRow(headers);
      reports.forEach((r) => ws.addRow([
        r.user?.name ?? "", r.user?.employeeId ?? "", r.mmyyyy,
        r.businessOwner, r.preparedBy, r.reviewedBy,
        r.reportStatus?.statusName ?? "",
        r.customersRegistered, r.suppliersRegistered, r.newBrandProducts,
        r.successStories, r.websiteVisitors,
        r.challenges ?? "", r.salesBooking ?? "", r.targetVsAchievement ?? "", r.accomplishments ?? "",
      ]));
      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="all-reports.xlsx"');
      return res.send(Buffer.from(buf));
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="all-reports.pdf"');
    doc.on("error", (err) => { console.error("PDF error:", err); res.destroy(); });
    doc.pipe(res);
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
      doc.text("Challenges:"); doc.text(report.challenges || ""); doc.moveDown();
      doc.text("Sales Booking:"); doc.text(report.salesBooking || ""); doc.moveDown();
      doc.text("Target Vs Achievement:"); doc.text(report.targetVsAchievement || ""); doc.moveDown();
      doc.text("Accomplishments:"); doc.text(report.accomplishments || "");
      if (index !== reports.length - 1) doc.addPage();
    });
    doc.end();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to download reports");
  }
};
