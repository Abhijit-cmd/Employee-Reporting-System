const prisma = require("../prisma/prismaClient");

// ── CREATE REPORT ──────────────────────────────────────────────────────────────
exports.createReport = async (req, res) => {
  try {
    const {
      mmyyyy, businessOwner, preparedBy, reviewedBy,
      customersRegistered, suppliersRegistered, newBrandProducts,
      successStories, websiteVisitors,
      challenges, salesBooking, targetVsAchievement, accomplishments,
    } = req.body;

    const submittedStatus = await prisma.reportStatus.findFirst({
      where: { statusName: "Submitted" },
    });

    if (!submittedStatus) {
      return res.status(500).json({ message: "Report status not configured" });
    }

    const report = await prisma.report.create({
      data: {
        mmyyyy, businessOwner, preparedBy, reviewedBy,
        customersRegistered: Number(customersRegistered) || 0,
        suppliersRegistered: Number(suppliersRegistered) || 0,
        newBrandProducts:    Number(newBrandProducts)    || 0,
        successStories:      Number(successStories)      || 0,
        websiteVisitors:     Number(websiteVisitors)     || 0,
        challenges:          challenges          || "",
        salesBooking:        salesBooking        || "",
        targetVsAchievement: targetVsAchievement || "",
        accomplishments:     accomplishments     || "",
        user:         { connect: { id: req.user.id } },
        reportStatus: { connect: { id: submittedStatus.id } },
      },
    });

    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create report" });
  }
};

// ── MARK PENDING ───────────────────────────────────────────────────────────────
exports.markPending = async (req, res) => {
  try {
    const id = Number(req.params.reportId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid report ID" });

    const pendingStatus = await prisma.reportStatus.findFirst({
      where: { statusName: "Pending" },
    });
    if (!pendingStatus) return res.status(500).json({ message: "Status not configured" });

    await prisma.report.update({
      where: { id },
      data: { reportStatus: { connect: { id: pendingStatus.id } } },
    });
    res.status(200).json({ message: "Report marked as Pending" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ── MARK REVIEWED ──────────────────────────────────────────────────────────────
exports.markReviewed = async (req, res) => {
  try {
    const id = Number(req.params.reportId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid report ID" });

    const reviewedStatus = await prisma.reportStatus.findFirst({
      where: { statusName: "Submitted" },
    });
    if (!reviewedStatus) return res.status(500).json({ message: "Status not configured" });

    await prisma.report.update({
      where: { id },
      data: { reportStatus: { connect: { id: reviewedStatus.id } } },
    });
    res.status(200).json({ message: "Report marked as Reviewed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ── GET ALL REPORTS ────────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: { select: { id: true, name: true, employeeId: true, email: true } }, reportStatus: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// ── GET MY REPORTS ─────────────────────────────────────────────────────────────
exports.getMyReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user.id },
      include: { reportStatus: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
