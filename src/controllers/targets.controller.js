const prisma = require("../prisma/prismaClient");

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

exports.getTargets = async (req, res) => {
  try {
    const targets = await prisma.target.findMany({
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(targets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch targets" });
  }
};

exports.createTarget = async (req, res) => {
  try {
    const {
      employeeId,
      targetTitle,
      description,
      targetValue,
      targetMonth,
      targetYear,
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }
    if (!targetTitle) {
      return res.status(400).json({ message: "Target title is required" });
    }

    const tv = toNumber(targetValue);
    if (!Number.isFinite(tv) || tv <= 0) {
      return res.status(400).json({ message: "Target value must be a positive number" });
    }

    const year = toNumber(targetYear);
    if (!Number.isFinite(year) || year < 2000) {
      return res.status(400).json({ message: "Target year is invalid" });
    }

    if (!targetMonth) {
      return res.status(400).json({ message: "Target month is required" });
    }

    const employeePk = toNumber(employeeId);
    const employee =
      Number.isFinite(employeePk)
        ? await prisma.user.findUnique({ where: { id: employeePk } })
        : await prisma.user.findUnique({ where: { employeeId: String(employeeId) } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const created = await prisma.target.create({
      data: {
        userId: employee.id,
        targetTitle: String(targetTitle),
        description: description ? String(description) : null,
        targetValue: tv,
        targetMonth: String(targetMonth),
        targetYear: Math.trunc(year),
      },
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true },
        },
      },
    });

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ];
    const monthIndex = parseInt(String(targetMonth), 10);
    const monthName = monthNames[monthIndex - 1] ?? targetMonth;

    await prisma.notification.create({
      data: {
        userId: employee.id,
        title: 'New Target Assigned',
        message: `Admin has assigned you a new target: "${targetTitle}" for ${monthName} ${Math.trunc(year)}.`,
        notificationType: 'target',
      },
    }).catch(() => {});

    res.status(201).json({ message: "Target created successfully", target: created });
  } catch (error) {
    res.status(500).json({ message: "Failed to create target" });
  }
};
