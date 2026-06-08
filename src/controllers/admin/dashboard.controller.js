const prisma = require("../../prisma/prismaClient");

const successResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const errorResponse = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

exports.getAnalytics = async (req, res) => {
  try {
    const [reports, totalEmployees, targets] = await Promise.all([
      prisma.report.findMany({
        include: {
          user: { select: { name: true, employeeId: true } },
          reportStatus: true,
        },
        orderBy: { mmyyyy: "asc" },
      }),
      prisma.user.count({ where: { role: { roleName: "Employee" } } }),
      prisma.target.findMany({
        include: { employee: { select: { name: true } } },
      }),
    ]);

    const monthlyMap = new Map();
    for (const r of reports) {
      if (!monthlyMap.has(r.mmyyyy)) {
        monthlyMap.set(r.mmyyyy, { month: r.mmyyyy, total: 0, reviewed: 0, pending: 0, submitted: 0 });
      }
      const entry = monthlyMap.get(r.mmyyyy);
      entry.total++;
      const s = r.reportStatus?.statusName ?? "";
      if (s === "Reviewed") entry.reviewed++;
      else if (s === "Pending") entry.pending++;
      else if (s === "Submitted") entry.submitted++;
    }
    const monthlyTrend = Array.from(monthlyMap.values());

    const empMap = new Map();
    for (const r of reports) {
      const name = r.user?.name ?? "Unknown";
      empMap.set(name, (empMap.get(name) ?? 0) + 1);
    }
    const byEmployee = Array.from(empMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const statusMap = new Map();
    for (const r of reports) {
      const s = r.reportStatus?.statusName ?? "Unknown";
      statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
    }
    const byStatus = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    const targetData = targets.map((t) => ({
      name: t.employee?.name ?? "Unknown",
      target: t.targetValue,
      achieved: t.achievedValue,
    }));

    return successResponse(res, { totalReports: reports.length, totalEmployees, monthlyTrend, byEmployee, byStatus, targetData });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch analytics");
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const [totalEmployees, totalReports, reportsByStatus] = await Promise.all([
      prisma.user.count({ where: { role: { roleName: "Employee" } } }),
      prisma.report.count(),
      prisma.reportStatus.findMany({
        include: { _count: { select: { reports: true } } },
      }),
    ]);

    const statusMap = new Map();
    reportsByStatus.forEach((status) => {
      statusMap.set(status.statusName, status._count.reports);
    });

    return successResponse(res, {
      totalEmployees,
      totalReports,
      submittedReports: statusMap.get("Submitted") || 0,
      pendingReports: statusMap.get("Pending") || 0,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch dashboard summary");
  }
};

exports.getEmployeeTargetAchievements = async (req, res) => {
  try {
    const targets = await prisma.target.findMany({
      include: { employee: { select: { name: true } } },
    });

    const data = targets.map((target) => ({
      employeeName: target.employee?.name ?? "Unknown",
      targetValue: target.targetValue,
      achievedValue: target.achievedValue,
    }));

    return successResponse(res, data);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch target achievements");
  }
};
