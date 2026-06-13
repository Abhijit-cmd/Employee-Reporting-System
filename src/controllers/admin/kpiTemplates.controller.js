const prisma = require("../../prisma/prismaClient");

const APPRAISAL_SECTIONS = ["KPI", "COMPETENCY", "CREDIT_CONTROL"];

exports.getKpiTemplates = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = {};
    if (departmentId !== undefined) {
      const id = Number(departmentId);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid department ID" });
      where.departmentId = id;
    }

    const kpiTemplates = await prisma.kpiTemplate.findMany({
      where,
      orderBy: [{ departmentId: "asc" }, { displayOrder: "asc" }],
    });

    res.status(200).json(kpiTemplates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch KPI templates" });
  }
};

exports.createKpiTemplate = async (req, res) => {
  try {
    const { departmentId, name, description, displayOrder, section, weight } = req.body;

    const deptId = Number(departmentId);
    if (isNaN(deptId)) return res.status(400).json({ message: "Department is required" });
    if (!name?.trim()) return res.status(400).json({ message: "KPI name is required" });

    if (section !== undefined && !APPRAISAL_SECTIONS.includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    let weightValue = null;
    if (weight !== undefined && weight !== null && weight !== "") {
      weightValue = Number(weight);
      if (!Number.isFinite(weightValue)) return res.status(400).json({ message: "Weight must be a number" });
    }

    const department = await prisma.department.findUnique({ where: { id: deptId } });
    if (!department) return res.status(404).json({ message: "Department not found" });

    const trimmedName = name.trim();
    const existing = await prisma.kpiTemplate.findFirst({ where: { departmentId: deptId, name: trimmedName } });
    if (existing) return res.status(409).json({ message: "A KPI with this name already exists for this department" });

    const kpiTemplate = await prisma.kpiTemplate.create({
      data: {
        departmentId: deptId,
        name: trimmedName,
        description: description?.trim() || null,
        displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
        section: section || "KPI",
        weight: weightValue,
      },
    });

    res.status(201).json({ message: "KPI template created successfully", kpiTemplate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create KPI template" });
  }
};

exports.updateKpiTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid KPI template ID" });

    const existing = await prisma.kpiTemplate.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "KPI template not found" });

    const { name, description, displayOrder, section, weight } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "KPI name cannot be empty" });
      const trimmedName = name.trim();
      const duplicate = await prisma.kpiTemplate.findFirst({
        where: { departmentId: existing.departmentId, name: trimmedName, NOT: { id } },
      });
      if (duplicate) return res.status(409).json({ message: "A KPI with this name already exists for this department" });
      updateData.name = trimmedName;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (displayOrder !== undefined) {
      const order = Number(displayOrder);
      if (!Number.isFinite(order)) return res.status(400).json({ message: "Display order must be a number" });
      updateData.displayOrder = order;
    }

    if (section !== undefined) {
      if (!APPRAISAL_SECTIONS.includes(section)) return res.status(400).json({ message: "Invalid section" });
      updateData.section = section;
    }

    if (weight !== undefined) {
      if (weight === null || weight === "") {
        updateData.weight = null;
      } else {
        const weightValue = Number(weight);
        if (!Number.isFinite(weightValue)) return res.status(400).json({ message: "Weight must be a number" });
        updateData.weight = weightValue;
      }
    }

    const kpiTemplate = await prisma.kpiTemplate.update({ where: { id }, data: updateData });
    res.status(200).json({ message: "KPI template updated successfully", kpiTemplate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update KPI template" });
  }
};

exports.deleteKpiTemplate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid KPI template ID" });

    const existing = await prisma.kpiTemplate.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "KPI template not found" });

    await prisma.kpiTemplate.delete({ where: { id } });
    res.status(200).json({ message: "KPI template deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete KPI template" });
  }
};
