const PDFDocument = require("pdfkit");
const prisma = require("../prisma/prismaClient");

exports.getReportById = async (req, res) => {
  try {
    const reportId = Number(req.params.id);

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: true,
        reportStatus: true,
      },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: true,
        reportStatus: true,
      },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report-${report.id}.pdf"`
    );

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

    const sections = [
      { title: "Challenges", content: report.challenges },
      { title: "Sales Booking", content: report.salesBooking },
      { title: "Target Vs Achievement", content: report.targetVsAchievement },
      { title: "Accomplishments", content: report.accomplishments },
    ];

    sections.forEach(({ title, content }) => {
      doc.fontSize(16).text(title);
      doc.fontSize(12).text(content || "N/A");
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.downloadAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: true,
        reportStatus: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="all-reports.pdf"'
    );

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

      const sections = [
        { title: "Challenges", content: report.challenges },
        { title: "Sales Booking", content: report.salesBooking },
        { title: "Target Vs Achievement", content: report.targetVsAchievement },
        { title: "Accomplishments", content: report.accomplishments },
      ];

      sections.forEach(({ title, content }) => {
        doc.text(`${title}:`);
        doc.text(content || "N/A");
        doc.moveDown();
      });

      if (index !== reports.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
