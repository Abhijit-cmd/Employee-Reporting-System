const prisma = require("../../prisma/prismaClient");
const bcrypt = require("bcrypt");
const { teamFilter } = require("../../utils/scope");

// Returns { provided, value, error } — provided=false means the field was not sent at all,
// provided=true with value=null means "unset this field".
async function resolveDepartmentId(departmentId) {
  if (departmentId === undefined) return { provided: false };
  if (departmentId === null || departmentId === "") return { provided: true, value: null };

  const id = Number(departmentId);
  if (isNaN(id)) return { error: "Invalid department" };

  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) return { error: "Department not found" };

  return { provided: true, value: id };
}

async function resolveManagerId(managerId) {
  if (managerId === undefined) return { provided: false };
  if (managerId === null || managerId === "") return { provided: true, value: null };

  const id = Number(managerId);
  if (isNaN(id)) return { error: "Invalid manager" };

  const manager = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!manager) return { error: "Manager not found" };
  if (!["Manager", "Leadership"].includes(manager.role?.roleName)) {
    return { error: "Selected user is not a Manager or Leadership account" };
  }

  return { provided: true, value: id };
}

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, password, departmentId, managerId, designation, location } = req.body;

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

    const deptResult = await resolveDepartmentId(departmentId);
    if (deptResult.error) return res.status(400).json({ message: deptResult.error });

    // Employees created by a Manager are automatically assigned to that Manager.
    let managerResult;
    if (req.user.role === "Manager") {
      managerResult = { provided: true, value: req.user.id };
    } else {
      managerResult = await resolveManagerId(managerId);
      if (managerResult.error) return res.status(400).json({ message: managerResult.error });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || "",
          password: hashedPassword,
          roleId: employeeRole.id,
          departmentId: deptResult.provided ? deptResult.value : undefined,
          managerId: managerResult.provided ? managerResult.value : undefined,
          designation: designation?.trim() || null,
          location: location?.trim() || null,
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
      ...teamFilter(req.user),
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
      include: {
        role: true,
        department: true,
        manager: { select: { id: true, name: true, employeeId: true } },
      },
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
      departmentId: employee.departmentId,
      managerId: employee.managerId,
      department: employee.department ? { id: employee.department.id, name: employee.department.name } : null,
      manager: employee.manager ? { id: employee.manager.id, name: employee.manager.name, employeeId: employee.manager.employeeId } : null,
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

    const { name, email, phone, password, departmentId, managerId, designation, location } = req.body;

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return res.status(404).json({ message: "Employee not found" });
    if (user.role?.roleName !== "Employee") return res.status(403).json({ message: "Can only edit employee accounts" });

    if (req.user.role === "Manager" && user.managerId !== req.user.id) {
      return res.status(404).json({ message: "Employee not found" });
    }

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

    if (designation !== undefined) {
      updateData.designation = designation?.trim() || null;
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null;
    }

    if (password !== undefined && password.trim()) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase and a number" });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const deptResult = await resolveDepartmentId(departmentId);
    if (deptResult.error) return res.status(400).json({ message: deptResult.error });
    if (deptResult.provided) updateData.departmentId = deptResult.value;

    if (req.user.role === "Manager") {
      if (managerId !== undefined) {
        return res.status(403).json({ message: "Managers cannot reassign an employee's manager" });
      }
    } else {
      const managerResult = await resolveManagerId(managerId);
      if (managerResult.error) return res.status(400).json({ message: managerResult.error });
      if (managerResult.provided) updateData.managerId = managerResult.value;
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

exports.getManagers = async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: { roleName: "Manager" } },
      include: {
        department: true,
        manager: { select: { id: true, name: true, employeeId: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const safeManagers = managers.map((manager) => ({
      id: manager.id,
      employeeId: manager.employeeId,
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      status: manager.status,
      createdAt: manager.createdAt,
      departmentId: manager.departmentId,
      managerId: manager.managerId,
      department: manager.department ? { id: manager.department.id, name: manager.department.name } : null,
      manager: manager.manager ? { id: manager.manager.id, name: manager.manager.name, employeeId: manager.manager.employeeId } : null,
    }));

    res.status(200).json(safeManagers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch managers" });
  }
};

exports.getLeadership = async (req, res) => {
  try {
    const leadership = await prisma.user.findMany({
      where: { role: { roleName: "Leadership" } },
      select: { id: true, name: true, employeeId: true },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(leadership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leadership accounts" });
  }
};

exports.createManager = async (req, res) => {
  try {
    const { name, email, phone, password, departmentId, managerId, designation, location } = req.body;

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

    const managerRole = await prisma.role.findFirst({ where: { roleName: "Manager" } });
    if (!managerRole) return res.status(500).json({ message: "Manager role not found" });

    const deptResult = await resolveDepartmentId(departmentId);
    if (deptResult.error) return res.status(400).json({ message: deptResult.error });

    const managerResult = await resolveManagerId(managerId);
    if (managerResult.error) return res.status(400).json({ message: managerResult.error });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || "",
          password: hashedPassword,
          roleId: managerRole.id,
          departmentId: deptResult.provided ? deptResult.value : undefined,
          managerId: managerResult.provided ? managerResult.value : undefined,
          designation: designation?.trim() || null,
          location: location?.trim() || null,
        },
      });
      const managerCount = await tx.user.count({ where: { role: { roleName: "Manager" } } });
      const employeeId = `MGR-${String(managerCount).padStart(3, "0")}`;
      return tx.user.update({ where: { id: created.id }, data: { employeeId } });
    });

    res.status(201).json({
      message: "Manager created successfully",
      user: { id: user.id, employeeId: user.employeeId, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create manager" });
  }
};

exports.updateManager = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid manager ID" });

    const { name, email, phone, password, departmentId, managerId, designation, location } = req.body;

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return res.status(404).json({ message: "Manager not found" });
    if (user.role?.roleName !== "Manager") return res.status(403).json({ message: "Can only edit manager accounts" });

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
      updateData.phone = phone.trim();
    }

    if (designation !== undefined) {
      updateData.designation = designation?.trim() || null;
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null;
    }

    if (password !== undefined && password.trim()) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase and a number" });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const deptResult = await resolveDepartmentId(departmentId);
    if (deptResult.error) return res.status(400).json({ message: deptResult.error });
    if (deptResult.provided) updateData.departmentId = deptResult.value;

    const managerResult = await resolveManagerId(managerId);
    if (managerResult.error) return res.status(400).json({ message: managerResult.error });
    if (managerResult.provided) updateData.managerId = managerResult.value;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, employeeId: true },
    });

    res.status(200).json({ message: "Manager updated successfully", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update manager" });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid manager ID" });

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return res.status(404).json({ message: "Manager not found" });

    if (id === req.user.id) return res.status(403).json({ message: "Cannot delete your own account" });

    if (user.role?.roleName !== "Manager") return res.status(403).json({ message: "Cannot delete this account" });

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete manager" });
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

    if (req.user.role === "Manager" && user.managerId !== req.user.id) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
