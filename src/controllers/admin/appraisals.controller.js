const prisma = require("../../prisma/prismaClient");

const APPRAISAL_SECTIONS = ["KPI", "COMPETENCY", "CREDIT_CONTROL"];

exports.getRaisableUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "Manager") {
      users = await prisma.user.findMany({
        where: { managerId: req.user.id, role: { roleName: "Employee" } },
        include: { department: true },
        orderBy: { name: "asc" },
      });
    } else if (req.user.role === "Leadership") {
      users = await prisma.user.findMany({
        where: { role: { roleName: "Manager" } },
        include: { department: true },
        orderBy: { name: "asc" },
      });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      employeeId: u.employeeId,
      departmentId: u.departmentId,
      designation: u.designation,
      location: u.location,
      department: u.department ? { id: u.department.id, name: u.department.name } : null,
    }));

    res.status(200).json(safeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch raisable users" });
  }
};

exports.getKpiTemplatesForUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return res.status(404).json({ message: "User not found" });

    if (!target.departmentId) {
      return res.status(400).json({ message: "This user has no department assigned. Ask Leadership to assign one before raising an appraisal." });
    }

    const kpiTemplates = await prisma.kpiTemplate.findMany({
      where: { departmentId: target.departmentId },
      orderBy: [{ section: "asc" }, { displayOrder: "asc" }],
    });

    res.status(200).json(kpiTemplates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch KPI templates" });
  }
};

exports.raiseAppraisal = async (req, res) => {
  try {
    const {
      userId,
      periodYear,
      periodMonth,
      periodQuarter,
      overallComment,
      kpiEntries,
      creditControlComment,
      managerStrengths,
      managerDevelopmentAreas,
      actionPromotion,
      actionSalaryIncrement,
      actionPerformanceIncentive,
      actionTrainingDevelopment,
      actionRoleEnhancement,
      finalRating,
      ceoName,
      ceoSignDate,
      hrName,
      hrSignDate,
    } = req.body;

    const targetId = Number(userId);
    if (isNaN(targetId)) return res.status(400).json({ message: "userId is required" });

    const year = Number(periodYear);
    if (!Number.isFinite(year) || year < 2000) return res.status(400).json({ message: "Invalid period year" });

    let month = null;
    if (periodMonth !== undefined && periodMonth !== null && periodMonth !== "") {
      month = Number(periodMonth);
      if (!Number.isInteger(month) || month < 1 || month > 12) return res.status(400).json({ message: "Invalid period month" });
    }

    let quarter = null;
    if (periodQuarter !== undefined && periodQuarter !== null && periodQuarter !== "") {
      quarter = Number(periodQuarter);
      if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) return res.status(400).json({ message: "Invalid period quarter" });
    }

    const rating = Number(finalRating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Final rating must be an integer between 1 and 5" });
    }

    if (!Array.isArray(kpiEntries) || kpiEntries.length === 0) {
      return res.status(400).json({ message: "At least one KPI entry is required" });
    }

    for (const entry of kpiEntries) {
      if (!entry?.kpiName?.toString().trim()) return res.status(400).json({ message: "Each KPI entry requires a name" });
      const score = Number(entry?.score);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        return res.status(400).json({ message: "Each KPI score must be an integer between 1 and 5" });
      }
      if (entry.section !== undefined && !APPRAISAL_SECTIONS.includes(entry.section)) {
        return res.status(400).json({ message: "Invalid KPI entry section" });
      }
      if (entry.weight !== undefined && entry.weight !== null && !Number.isFinite(Number(entry.weight))) {
        return res.status(400).json({ message: "KPI entry weight must be a number" });
      }
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      include: { role: true, department: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });

    if (req.user.role === "Manager") {
      if (target.role?.roleName !== "Employee" || target.managerId !== req.user.id) {
        return res.status(403).json({ message: "You can only raise appraisals for your own employees" });
      }
    } else if (req.user.role === "Leadership") {
      if (target.role?.roleName !== "Manager") {
        return res.status(403).json({ message: "You can only raise appraisals for Managers" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!target.department) {
      return res.status(400).json({ message: "This user has no department assigned. Ask Leadership to assign one before raising an appraisal." });
    }

    const appraisal = await prisma.$transaction((tx) =>
      tx.appraisal.create({
        data: {
          raisedById: req.user.id,
          userId: target.id,
          departmentName: target.department.name,
          periodMonth: month,
          periodYear: Math.trunc(year),
          periodQuarter: quarter,
          overallComment: overallComment?.toString().trim() || null,
          creditControlComment: creditControlComment?.toString().trim() || null,
          managerStrengths: managerStrengths?.toString().trim() || null,
          managerDevelopmentAreas: managerDevelopmentAreas?.toString().trim() || null,
          actionPromotion: Boolean(actionPromotion),
          actionSalaryIncrement: Boolean(actionSalaryIncrement),
          actionPerformanceIncentive: Boolean(actionPerformanceIncentive),
          actionTrainingDevelopment: Boolean(actionTrainingDevelopment),
          actionRoleEnhancement: Boolean(actionRoleEnhancement),
          finalRating: rating,
          ceoName: ceoName?.toString().trim() || null,
          ceoSignDate: ceoSignDate?.toString().trim() || null,
          hrName: hrName?.toString().trim() || null,
          hrSignDate: hrSignDate?.toString().trim() || null,
          kpiEntries: {
            create: kpiEntries.map((entry) => ({
              kpiTemplateId: entry.kpiTemplateId ? Number(entry.kpiTemplateId) : null,
              kpiName: String(entry.kpiName).trim(),
              section: entry.section || "KPI",
              weight: entry.weight !== undefined && entry.weight !== null ? Number(entry.weight) : null,
              target: entry.target?.toString().trim() || null,
              achievement: entry.achievement?.toString().trim() || null,
              score: Number(entry.score),
              comment: entry.comment?.toString().trim() || null,
            })),
          },
        },
        include: { kpiEntries: true },
      })
    );

    const message =
      req.user.role === "Manager"
        ? "Your manager has raised a performance appraisal for you."
        : "Leadership has raised a performance appraisal for you.";

    prisma.notification.create({
      data: {
        userId: target.id,
        title: "Performance Appraisal Raised",
        message,
        notificationType: "appraisal",
      },
    }).catch(() => {});

    res.status(201).json({ message: "Appraisal raised successfully", appraisal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to raise appraisal" });
  }
};

exports.getRaisedAppraisals = async (req, res) => {
  try {
    const appraisals = await prisma.appraisal.findMany({
      where: { raisedById: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            designation: true,
            location: true,
            department: { select: { name: true } },
          },
        },
        kpiEntries: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch raised appraisals" });
  }
};

exports.getAppraisalById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

    const appraisal = await prisma.appraisal.findFirst({
      where: { id, raisedById: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            designation: true,
            location: true,
            department: { select: { name: true } },
          },
        },
        kpiEntries: true,
      },
    });

    if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });
    res.status(200).json(appraisal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch appraisal" });
  }
};
