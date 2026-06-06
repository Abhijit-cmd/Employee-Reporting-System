const prisma = require("../prisma/prismaClient");

// ── CREATE REPORT ────────────────────────────────────────────────────────────────────
exports.createReport = async (req, res) => {
  try {
    const {
      reportMonth, businessOwner, preparedBy, reviewedBy,
      customersRegistered, suppliersRegistered, newBrandProducts,
      successStories, websiteVisitors,
      challenges, salesBooking, targetVsAchievement, accomplishments,
    } = req.body;

    // ===== VALIDATION START =====

    if (!mmyyyy?.trim()) {
      return res.status(400).json({ message: "Month/Year is required" });
    }

    if (!businessOwner?.trim()) {
      return res.status(400).json({ message: "Business Owner is required" });
    }

    if (!preparedBy?.trim()) {
      return res.status(400).json({ message: "Prepared By is required" });
    }

    if (!reviewedBy?.trim()) {
      return res.status(400).json({ message: "Reviewed By is required" });
    }

    if (!/^(0[1-9]|1[0-2])\d{4}$/.test(mmyyyy)) {
      return res.status(400).json({
        message: "Month/Year must be in MMYYYY format"
      });
    }

    const numericFields = {
      customersRegistered,
      suppliersRegistered,
      newBrandProducts,
      successStories,
      websiteVisitors,
    };

    for (const [field, value] of Object.entries(numericFields)) {
      const num = Number(value);

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(num) ||
        num < 0
      ) {
        return res.status(400).json({
          message: `${field} must be a valid non-negative number`,
        });
      }
    }

    // ===== VALIDATION END =====

    const submittedStatus = await prisma.reportStatus.findFirst({
      where: { statusName: "Submitted" },
    });

    if (!submittedStatus) {
      return res.status(500).json({ message: "Report status not found" });
    }
    const existingReport = await prisma.report.findFirst({
      where: {
        userId: req.user.id,
        mmyyyy,
      },
    });

    if (existingReport) {
      return res.status(409).json({
        message: "You have already submitted a report for this month",
      });
    }

    const report = await prisma.report.create({
      data: {
        mmyyyy,
        businessOwner,
        preparedBy,
        reviewedBy,

        customersRegistered: Number(customersRegistered),
        suppliersRegistered: Number(suppliersRegistered),
        newBrandProducts: Number(newBrandProducts),
        successStories: Number(successStories),
        websiteVisitors: Number(websiteVisitors),

        challenges: challenges || "",
        salesBooking: salesBooking || "",
        targetVsAchievement: targetVsAchievement || "",
        accomplishments: accomplishments || "",

        user: { connect: { id: req.user.id } },
        reportStatus: { connect: { id: submittedStatus.id } },
      },
    });

    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Failed to create report" });
  }
};

// ── MARK PENDING ────────────────────────────────────────────────────────────────────
exports.markPending = async (req, res) => {
  try {
    const { reportId } = req.params;
    const pendingStatus = await prisma.reportStatus.findFirst({
      where: { statusName: "Pending" },
    });
    await prisma.report.update({
      where: { id: Number(reportId) },
      data: { reportStatus: { connect: { id: pendingStatus.id } } },
    });
    res.status(200).json({ message: "Report marked as Pending" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create report" });
  }
};

// ── MARK REVIEWED ────────────────────────────────────────────────────────────────────
exports.markReviewed = async (req, res) => {
  try {
    const { reportId } = req.params;
    const reviewedStatus = await prisma.reportStatus.findFirst({
      where: { statusName: "Reviewed" },
    });
    await prisma.report.update({
      where: { id: Number(reportId) },
      data: { reportStatus: { connect: { id: reviewedStatus.id } } },
    });
    res.status(200).json({ message: "Report marked as Reviewed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ── GET ALL REPORTS ────────────────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const reports = await prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        reportStatus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalReports = await prisma.report.count();
    res.status(200).json({
      reports,
      page,
      limit,
      totalReports,
      totalPages: Math.ceil(totalReports / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// ── GET MY REPORTS ────────────────────────────────────────────────────────────────────
exports.getMyReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user.id },
      include: { reportStatus: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
