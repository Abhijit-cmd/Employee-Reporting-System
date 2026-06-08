const prisma = require("../../prisma/prismaClient");

exports.createReport = async (req, res) => {
  try {
    const {
      mmyyyy, businessOwner, preparedBy, reviewedBy,
      customersRegistered, suppliersRegistered, newBrandProducts,
      successStories, websiteVisitors,
      challenges, salesBooking, targetVsAchievement, accomplishments,
    } = req.body;

    if (!mmyyyy?.trim()) return res.status(400).json({ message: "Month/Year is required" });
    if (!businessOwner?.trim()) return res.status(400).json({ message: "Business Owner is required" });
    if (!preparedBy?.trim()) return res.status(400).json({ message: "Prepared By is required" });
    if (!reviewedBy?.trim()) return res.status(400).json({ message: "Reviewed By is required" });

    if (!/^(0[1-9]|1[0-2])\d{4}$/.test(mmyyyy)) {
      return res.status(400).json({ message: "Month/Year must be in MMYYYY format" });
    }

    const numericFields = { customersRegistered, suppliersRegistered, newBrandProducts, successStories, websiteVisitors };
    for (const [field, value] of Object.entries(numericFields)) {
      const num = Number(value);
      if (value === undefined || value === null || value === "" || Number.isNaN(num) || num < 0) {
        return res.status(400).json({ message: `${field} must be a valid non-negative number` });
      }
    }

    const submittedStatus = await prisma.reportStatus.findFirst({ where: { statusName: "Submitted" } });
    if (!submittedStatus) return res.status(500).json({ message: "Report status not found" });

    const existingReport = await prisma.report.findFirst({ where: { userId: req.user.id, mmyyyy } });
    if (existingReport) {
      return res.status(409).json({ message: "You have already submitted a report for this month" });
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
        challenges: (challenges || "").trim(),
        salesBooking: (salesBooking || "").trim(),
        targetVsAchievement: (targetVsAchievement || "").trim(),
        accomplishments: (accomplishments || "").trim(),
        user: { connect: { id: req.user.id } },
        reportStatus: { connect: { id: submittedStatus.id } },
      },
    });

    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create report" });
  }
};

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

exports.getMyTargets = async (req, res) => {
  try {
    const targets = await prisma.target.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(targets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch targets" });
  }
};

exports.updateTargetAchieved = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid target ID" });

    const target = await prisma.target.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: "Target not found" });
    if (target.userId !== req.user.id) return res.status(403).json({ message: "Not your target" });

    const achieved = Number(req.body.achievedValue);
    if (!Number.isFinite(achieved) || achieved < 0) {
      return res.status(400).json({ message: "Achieved value must be a non-negative number" });
    }

    const updated = await prisma.target.update({ where: { id }, data: { achievedValue: achieved } });
    res.status(200).json({ message: "Target updated", target: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update target" });
  }
};
