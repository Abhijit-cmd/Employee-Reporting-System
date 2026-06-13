const prisma = require("../../prisma/prismaClient");

const APPRAISAL_USER_SELECT = {
  id: true,
  name: true,
  employeeId: true,
  designation: true,
  location: true,
  department: { select: { name: true } },
};

exports.getMyAppraisals = async (req, res) => {
  try {
    const appraisals = await prisma.appraisal.findMany({
      where: { userId: req.user.id },
      include: {
        raisedBy: { select: { id: true, name: true, employeeId: true } },
        user: { select: APPRAISAL_USER_SELECT },
        kpiEntries: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch appraisals" });
  }
};

exports.getMyAppraisalById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

    const appraisal = await prisma.appraisal.findFirst({
      where: { id, userId: req.user.id },
      include: {
        raisedBy: { select: { id: true, name: true, employeeId: true } },
        user: { select: APPRAISAL_USER_SELECT },
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

exports.acknowledgeAppraisal = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

    const appraisal = await prisma.appraisal.findFirst({ where: { id, userId: req.user.id } });
    if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });

    if (appraisal.status !== "Pending") {
      return res.status(400).json({ message: "Appraisal has already been acknowledged" });
    }

    const updated = await prisma.appraisal.update({
      where: { id },
      data: { status: "Acknowledged", acknowledgedAt: new Date() },
    });

    res.status(200).json({ message: "Appraisal acknowledged", appraisal: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to acknowledge appraisal" });
  }
};

exports.updateMySelfAssessment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

    const appraisal = await prisma.appraisal.findFirst({ where: { id, userId: req.user.id } });
    if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });

    const { selfAchievements, selfChallenges, selfImprovements, selfSupportNeeded } = req.body;
    const updateData = {};

    if (selfAchievements !== undefined) updateData.selfAchievements = selfAchievements?.toString().trim() || null;
    if (selfChallenges !== undefined) updateData.selfChallenges = selfChallenges?.toString().trim() || null;
    if (selfImprovements !== undefined) updateData.selfImprovements = selfImprovements?.toString().trim() || null;
    if (selfSupportNeeded !== undefined) updateData.selfSupportNeeded = selfSupportNeeded?.toString().trim() || null;

    const updated = await prisma.appraisal.update({ where: { id }, data: updateData });
    res.status(200).json({ message: "Self-assessment saved", appraisal: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save self-assessment" });
  }
};
