const prisma = require("../../prisma/prismaClient");

exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Department name is required" });

    const trimmed = name.trim();
    const existing = await prisma.department.findUnique({ where: { name: trimmed } });
    if (existing) return res.status(409).json({ message: "A department with this name already exists" });

    const department = await prisma.department.create({ data: { name: trimmed } });
    res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create department" });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid department ID" });

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Department name is required" });

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Department not found" });

    const trimmed = name.trim();
    const duplicate = await prisma.department.findFirst({ where: { name: trimmed, NOT: { id } } });
    if (duplicate) return res.status(409).json({ message: "A department with this name already exists" });

    const department = await prisma.department.update({ where: { id }, data: { name: trimmed } });
    res.status(200).json({ message: "Department updated successfully", department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update department" });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid department ID" });

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Department not found" });

    const [userCount, kpiCount] = await Promise.all([
      prisma.user.count({ where: { departmentId: id } }),
      prisma.kpiTemplate.count({ where: { departmentId: id } }),
    ]);

    if (userCount > 0 || kpiCount > 0) {
      return res.status(409).json({ message: "Cannot delete a department that has assigned users or KPI templates" });
    }

    await prisma.department.delete({ where: { id } });
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete department" });
  }
};
