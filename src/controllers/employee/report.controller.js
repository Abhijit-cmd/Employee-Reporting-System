const prisma = require("../../prisma/prismaClient");
const bcrypt = require("bcrypt");

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

exports.getReportById = async (req, res) => {
  try {
    const report = await prisma.report.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: { reportStatus: true },
    });

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch report" });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const {
      mmyyyy, businessOwner, preparedBy, reviewedBy,
      customersRegistered, suppliersRegistered, newBrandProducts,
      successStories, websiteVisitors,
      challenges, salesBooking, targetVsAchievement, accomplishments,
    } = req.body;

    const report = await prisma.report.findFirst({ where: { id: reportId, userId: req.user.id } });
    if (!report) return res.status(404).json({ message: "Report not found" });

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

    const duplicate = await prisma.report.findFirst({
      where: { userId: req.user.id, mmyyyy, NOT: { id: reportId } },
    });
    if (duplicate) {
      return res.status(409).json({ message: "You have already submitted a report for this month" });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
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
      },
    });

    res.status(200).json({ message: "Report updated successfully", report: updatedReport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update report" });
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

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword?.trim()) return res.status(400).json({ message: "Current password is required" });
    if (!newPassword?.trim()) return res.status(400).json({ message: "New password is required" });
    if (!confirmNewPassword?.trim()) return res.status(400).json({ message: "Confirm new password is required" });

    if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });

    if (newPassword !== confirmNewPassword) return res.status(400).json({ message: "New password and confirm password must match" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCurrentPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const isNewPasswordSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSameAsCurrent) return res.status(400).json({ message: "New password cannot be the same as current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update password" });
  }
};
