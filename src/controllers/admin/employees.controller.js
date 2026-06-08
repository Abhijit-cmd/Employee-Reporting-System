const prisma = require("../../prisma/prismaClient");
const bcrypt = require("bcrypt");

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const nameRegex = /^[A-Za-z\s'-]{2,50}$/;
    if (!nameRegex.test(name.trim())) return res.status(400).json({ message: "Name must contain only letters and spaces (2–50 characters)" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return res.status(400).json({ message: "Invalid email address" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password must be 8–20 characters with uppercase, lowercase and a number" });

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const employeeRole = await prisma.role.findFirst({ where: { roleName: "Employee" } });
    if (!employeeRole) return res.status(500).json({ message: "Employee role not found" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || "",
          password: hashedPassword,
          role: { connect: { id: employeeRole.id } },
        },
      });
      const empCount = await tx.user.count({ where: { role: { roleName: "Employee" } } });
      const employeeId = `CMAT-${String(empCount).padStart(3, "0")}`;
      return tx.user.update({ where: { id: created.id }, data: { employeeId } });
    });

    res.status(201).json({
      message: "Employee created successfully",
      user: { id: user.id, employeeId: user.employeeId, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create employee" });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";

    const whereClause = {
      role: { roleName: "Employee" },
    };

    // MySQL does not support mode:'insensitive' — rely on DB collation
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      include: { role: true },
    });

    const safeEmployees = employees.map((employee) => ({
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      status: employee.status,
      createdAt: employee.createdAt,
      role: employee.role?.roleName || "Unknown",
    }));

    res.status(200).json(safeEmployees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid employee ID" });

    const { name, email, phone, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return res.status(404).json({ message: "Employee not found" });
    if (user.role?.roleName !== "Employee") return res.status(403).json({ message: "Can only edit employee accounts" });

    const updateData = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ message: "Name cannot be empty" });
      updateData.name = trimmed;
    }

    if (email !== undefined) {
      const trimmed = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return res.status(400).json({ message: "Invalid email address" });
      const existing = await prisma.user.findFirst({ where: { email: trimmed, NOT: { id } } });
      if (existing) return res.status(409).json({ message: "Email already in use" });
      updateData.email = trimmed;
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    if (password !== undefined && password.trim()) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase and a number" });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, employeeId: true },
    });

    res.status(200).json({ message: "Employee updated successfully", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update employee" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (id === req.user.id) {
      return res.status(403).json({ message: "Cannot delete your own account" });
    }

    if (user.role?.roleName !== "Employee") {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
