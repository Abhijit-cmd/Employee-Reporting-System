const prisma = require("../prisma/prismaClient");
const PDFDocument = require("pdfkit");

// Helper function for standard API responses
const successResponse = (res, data, status = 200) => {
  return res.status(status).json({ success: true, data });
};

const errorResponse = (res, message, status = 500) => {
  return res.status(status).json({ success: false, message });
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
        employee: true,
      },
    });

    // Transform the data to what the frontend needs
    const data = targets.map(target => ({
      employeeName: target.employee.name,
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
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { user: true, reportStatus: true },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }
    return successResponse(res, report);
  } catch (error) {
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
        include: { user: true, reportStatus: true },
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
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { user: true, reportStatus: true },
    });

    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }
    const doc = new PDFDocument();
    const fileName = `report-${report.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
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
    console.log(error);
    return errorResponse(res, "Failed to download report");
  }
};

exports.downloadAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: true, reportStatus: true },
      take: 10,
    });

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="all-reports.pdf"');
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
    console.log(error);
    return errorResponse(res, "Failed to download reports");
  }
};
