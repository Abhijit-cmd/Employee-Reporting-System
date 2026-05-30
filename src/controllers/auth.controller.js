const prisma = require("../prisma/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (phone && !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const roleName = role === "admin" ? "Admin" : "Employee";
    const roleRecord = await prisma.role.findUnique({ where: { roleName } });
    if (!roleRecord) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Atomic employee ID generation via transaction
    const user = await prisma.$transaction(async (tx) => {
      const lastUser = await tx.user.findFirst({
        where: { employeeId: { not: null } },
        orderBy: { id: "desc" },
        select: { employeeId: true },
      });
      const nextNum = lastUser?.employeeId
        ? parseInt(lastUser.employeeId.replace("EMP", ""), 10) + 1
        : 1;
      const employeeId = `EMP${String(nextNum).padStart(3, "0")}`;

      return tx.user.create({
        data: {
          employeeId,
          name: name.trim(),
          phone,
          email,
          password: hashedPassword,
          role: { connect: { id: roleRecord.id } },
        },
        include: { role: true },
      });
    });

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Use consistent error to prevent user enumeration
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: { roleName: "Employee" } },
      include: { role: true },
    });

    res.status(200).json(employees.map(safeUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};
