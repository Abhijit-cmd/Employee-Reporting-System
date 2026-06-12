const prisma = require("../../prisma/prismaClient");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

const successResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const errorResponse = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

// Wrap text to fit within maxWidth, breaking long words if needed
function wrapText(doc, text, maxWidth, fontSize) {
  if (!text) return [];
  doc.fontSize(fontSize);
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach(word => {
    const test = current ? current + " " + word : word;
    if (doc.widthOfString(test) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      if (doc.widthOfString(word) > maxWidth) {
        let remaining = word;
        while (remaining.length > 0) {
          let chunk = remaining;
          while (chunk.length > 0 && doc.widthOfString(chunk) > maxWidth) {
            chunk = chunk.slice(0, -1);
          }
          lines.push(chunk);
          remaining = remaining.slice(chunk.length);
        }
        current = "";
      } else {
        current = word;
      }
    }
  });
  if (current) lines.push(current);
  return lines;
}

// Renders a single report as a structured, branded page in the PDF document
function generateReportPDF(doc, report, path, fs, logoPath, pageNumber) {
  const drawFooter = () => {
    const y = 770;
    doc.strokeColor("#E0E0E0").lineWidth(1).moveTo(50, y - 10).lineTo(550, y - 10).stroke();
    doc.font("Helvetica").fontSize(9).fillColor("#666");
    doc.text("Generated from Employee Reporting System", 50, y, { align: "left" });
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 0, y, { align: "center", width: 600 });
    doc.text(`Page ${pageNumber}`, 50, y, { align: "right" });
  };

  // --- Header ---
  doc.y = 30;
  if (fs.existsSync(logoPath)) {
    try { doc.image(logoPath, 50, 30, { width: 60, height: 60 }); } catch (e) {}
  }
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#D32F2F").text("Indithrive Infratech Pvt LTD", 130, 40);
  doc.fontSize(14).fillColor("#444").text("Monthly Overview", 130, 65);
  doc.strokeColor("#D32F2F").lineWidth(2).moveTo(50, 95).lineTo(550, 95).stroke();
  doc.y = 110;

  // --- Info section ---
  const monthYear = report.mmyyyy;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const m = parseInt(monthYear.slice(0, 2)) - 1;
  const y = monthYear.slice(2);
  const infoData = [
    ["Month & Year", `${months[m]} ${y}`],
    ["Business Owner", report.businessOwner],
    ["Prepared By", report.preparedBy],
    ["Reviewed By", report.reviewedBy],
    ["Employee Name", report.user?.name],
    ["Employee ID", report.user?.employeeId],
  ];
  doc.fillColor("#F9F9F9").rect(50, doc.y, 490, 78).fill();
  doc.strokeColor("#E0E0E0").lineWidth(1).rect(50, doc.y, 490, 78).stroke();
  const infoStartY = doc.y + 10;
  infoData.forEach((item, i) => {
    const x = i % 2 === 0 ? 60 : 330;
    const yPos = infoStartY + Math.floor(i / 2) * 22;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#555").text(item[0] + ":", x, yPos, { continued: true });
    doc.font("Helvetica").fillColor("#222").text(" " + (item[1] || ""));
  });
  doc.y = infoStartY + 78;

  // --- Cards (2x2) ---
  const cardWidth = 235;
  const cardGap = 20;
  const startX = 50;
  const startY = doc.y + 15;

  const calculateCardHeight = (content, isList = false) => {
    doc.font("Helvetica").fontSize(7);
    let height = 40; // title area
    if (isList) {
      content.forEach(({ label, value }) => {
        const text = `${label}: ${value || ""}`;
        height += doc.heightOfString(text, { width: cardWidth - 20 }) + 10;
      });
    } else {
      height += doc.heightOfString(String(content || ""), { width: cardWidth - 20 }) + 20;
    }
    return height + 20;
  };

  const card1Height = calculateCardHeight([
    { label: "Customer Registrations", value: report.customersRegistered },
    { label: "Supplier Registrations", value: report.suppliersRegistered },
    { label: "Products/Brands Added", value: report.newBrandProducts },
    { label: "New Success Stories", value: report.successStories },
    { label: "Website Visits", value: report.websiteVisitors },
  ], true);

  const card2Height = calculateCardHeight(report.challenges || "No challenges reported");

  const card3Height = calculateCardHeight([
    { label: "Sales Booking (Productwise Qty & Val)", value: report.salesBooking },
    { label: "Target vs Achievement", value: report.targetVsAchievement },
  ], true);

  const card4Height = calculateCardHeight(report.accomplishments || "No accomplishments reported");

  let topRowHeight = Math.max(card1Height, card2Height);
  let bottomRowHeight = Math.max(card3Height, card4Height);
  const totalCardsHeight = topRowHeight + cardGap + bottomRowHeight;

  const footerTop = 760;
  if (startY + totalCardsHeight > footerTop - 20) {
    const availableHeight = footerTop - startY - cardGap - 20;
    const newRowHeight = Math.floor(availableHeight / 2);
    topRowHeight = newRowHeight;
    bottomRowHeight = newRowHeight;
  }

  const drawCard = (x, y, w, h, title, content, isList = false) => {
    doc.fillColor("#FFF").rect(x, y, w, h).fill();
    doc.strokeColor("#D32F2F").lineWidth(1).rect(x, y, w, h).stroke();
    doc.fillColor("#D32F2F").rect(x, y, w, 30).fill();
    const titleLines = wrapText(doc, title, w - 20, 8);
    doc.fillColor("#FFF").font("Helvetica-Bold").fontSize(8);
    titleLines.forEach((line, i) => {
      doc.text(line, x + 10, y + 9 + i * 12, { width: w - 20 });
    });
    let cy = y + 40 + (titleLines.length - 1) * 12;
    const maxW = w - 20;
    doc.font("Helvetica").fontSize(7).fillColor("#333");

    if (isList) {
      content.forEach(({ label, value }) => {
        const fullText = `${label}: ${value || ""}`;
        doc.font("Helvetica").fontSize(7);
        doc.text(fullText, x + 10, cy, { width: maxW });
        cy += doc.heightOfString(fullText, { width: maxW }) + 8;
        cy += 6;
      });
    } else {
      doc.font("Helvetica").fontSize(7).fillColor("#333");
      const lines = wrapText(doc, String(content || "No data"), maxW, 7);
      lines.forEach(line => {
        doc.text(line, x + 10, cy);
        cy += 9;
      });
    }
  };

  drawCard(startX, startY, cardWidth, topRowHeight, "Key Performance Indicator", [
    { label: "Customer Registrations", value: report.customersRegistered },
    { label: "Supplier Registrations", value: report.suppliersRegistered },
    { label: "Products/Brands Added", value: report.newBrandProducts },
    { label: "New Success Stories", value: report.successStories },
    { label: "Website Visits", value: report.websiteVisitors },
  ], true);

  drawCard(startX + cardWidth + cardGap, startY, cardWidth, topRowHeight,
    "Customer/Supplier/Logistics/Finance Challenges", report.challenges || "No challenges reported");

  drawCard(startX, startY + topRowHeight + cardGap, cardWidth, bottomRowHeight,
    "Your Individual Metrics and YTD Achievement", [
      { label: "Sales Booking (Productwise Qty & Val)", value: report.salesBooking },
      { label: "Target vs Achievement", value: report.targetVsAchievement },
    ], true);

  drawCard(startX + cardWidth + cardGap, startY + topRowHeight + cardGap, cardWidth, bottomRowHeight,
    "Your Top Accomplishments YTD", report.accomplishments || "No accomplishments reported");

  drawFooter();
}

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

    const path = require("path");
    const fs = require("fs");
    const logoPath = path.join(__dirname, "../../../client/public/logo.png");

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.pdf"`);
    doc.on("error", (err) => { console.error("PDF error:", err); res.destroy(); });
    doc.pipe(res);

    generateReportPDF(doc, report, path, fs, logoPath, 1);
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

    const path = require("path");
    const fs = require("fs");
    const logoPath = path.join(__dirname, "../../../client/public/logo.png");

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="all-reports.pdf"');
    doc.on("error", (err) => { console.error("PDF error:", err); res.destroy(); });
    doc.pipe(res);

    reports.forEach((report, index) => {
      generateReportPDF(doc, report, path, fs, logoPath, index + 1);
      if (index < reports.length - 1) doc.addPage();
    });
    doc.end();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to download reports");
  }
};
