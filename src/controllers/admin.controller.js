const prisma = require("../prisma/prismaClient");

exports.getAdminProfile = async (req, res) => {

  try {
    const admin = await prisma.user.findUnique({
      where: {id: req.user.id,},
      include: {role: true,},
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }
    res.status(200).json(admin);
  }
  catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin profile",
    });
  }
};


exports.getAllReports = async (req, res) => {

  try {
    const reports = await prisma.report.findMany({
      include: { user: true, reportStatus: true, },
      orderBy: {createdAt: "desc",},
    });
    res.status(200).json(reports);
  } 
  catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
    });

  }

};

exports.getReportById = async (req, res) => {

  try {
    const reportId = Number(req.params.id);
    const report = await prisma.report.findUnique({
      where: {id: reportId,},
      include: { user: true, reportStatus: true,},
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }
    res.status(200).json(report);
  } 
  catch (error) {
    res.status(500).json({
      message: "Failed to fetch report",
    });
  }
};
const PDFDocument = require("pdfkit");

exports.downloadReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const report = await prisma.report.findUnique({
      where: {id: reportId,},
      include: {user: true,reportStatus: true,},
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }
    const doc = new PDFDocument();
    const fileName =`report-${report.id}.pdf`;

    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition",`attachment; filename="${fileName}"`);
    doc.pipe(res);
    // TITLE
    doc.fontSize(20).text("Monthly Report", {align: "center",});
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

  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: "Failed to download report",
      
    });
  }
};

exports.downloadAllReports = async (req, res) => {

  try {

    const reports = await prisma.report.findMany({
        include: {user: true, reportStatus: true,},
        orderBy: {createdAt: "desc",},

      });

    const PDFDocument =require("pdfkit");
    const doc =new PDFDocument({margin: 40,});
    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="all-reports.pdf"');
    doc.pipe(res);

    // TITLE
    doc.fontSize(22).text("All Employee Reports", {align: "center",});
    doc.moveDown(2);
    reports.forEach((report, index) => {
      doc.fontSize(18).text(`Report ${index + 1}`, {underline: true,});
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

      doc.text( `Customers Registered: ${report.customersRegistered}`);
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

    res.status(500).json({
      message: "Failed to download reports",
    });

  }

};