const prisma = require("../prisma/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX     = /^[A-Za-z\s'-]{3,50}$/;
const PHONE_REGEX    = /^[0-9]{10}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!NAME_REGEX.test(name)) {
      return res.status(400).json({ message: "Name must be 3-50 characters (letters only)" });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 100) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must be 8-20 characters with uppercase, lowercase, and a number",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // AUTO-GENERATE EMPLOYEE ID
    const lastUser = await prisma.user.findFirst({
      where: { employeeId: { not: null } },
      orderBy: { id: "desc" },
    });
    const nextNum = lastUser?.employeeId
      ? parseInt(lastUser.employeeId.replace("EMP", ""), 10) + 1
      : 1;
    const employeeId = `EMP${String(nextNum).padStart(3, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const employeeRole = await prisma.role.findFirst({ where: { roleName: "Employee" } });
    if (!employeeRole) {
      return res.status(500).json({ message: "Role not found" });
    }

    const user = await prisma.user.create({
      data: { employeeId, name, phone, email, password: hashedPassword, role: { connect: { id: employeeRole.id } } },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, employeeId: user.employeeId, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && user.role.roleName.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: "Invalid role selected" });
    }

    const accessToken = signAccess({ id: user.id, role: user.role.roleName });
    const refreshToken = signRefresh({ id: user.id, role: user.role.roleName });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.roleName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

// REFRESH ACCESS TOKEN
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const newAccessToken = signAccess({ id: decoded.id, role: decoded.role });
    const newRefreshToken = signRefresh({ id: decoded.id, role: decoded.role });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT USER
exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout failed" });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });
    res.status(200).json({
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.roleName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: { roleName: "Employee" } },
      include: { role: true },
    });
    res.status(200).json(
      employees.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        name: e.name,
        email: e.email,
        phone: e.phone,
        status: e.status,
        createdAt: e.createdAt,
        role: e.role.roleName,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
