const prisma = require("../prisma/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

// Helper function for error responses
const errorResponse = (res, message, status) => {
  return res.status(status).json({ message });
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    // CHECK EMPTY FIELDS
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // NAME VALIDATION
    const nameRegex = /^[A-Za-z\s'-]{3,50}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Name must contain only letters and spaces (3-50 characters)",
      });
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (email.length > 100) {
      return res.status(400).json({ message: "Email too long" });
    }

    // PHONE VALIDATION
    const phoneNumber = parsePhoneNumberFromString(phone, "IN");
    if (!phoneNumber || !phoneNumber.isValid()) {
      return errorResponse(res, "Invalid phone number", 400);
    }
    if (!/^[6-9]\d{9}$/.test(phoneNumber.nationalNumber)) {
      return errorResponse(res, "Invalid Indian mobile number", 400);
    }

    // PASSWORD VALIDATION
    if (password.length < 8 || password.length > 20) {
      return res.status(400).json({
        message: "Password must be between 8 and 20 characters",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase, and number",
      });
    }

    // CHECK EXISTING USER
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // FIND EMPLOYEE ROLE
    const employeeRole = await prisma.role.findFirst({
      where: { roleName: "Employee" },
    });

    if (!employeeRole) {
      return res.status(500).json({ message: "Role not found" });
    }

    // CREATE USER + SET employeeId IN A TRANSACTION
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          phone: phoneNumber.number,
          email,
          password: hashedPassword,
          role: { connect: { id: employeeRole.id } },
        },
      });
      const employeeId = `EMP${String(created.id).padStart(6, "0")}`;
      return tx.user.update({
        where: { id: created.id },
        data: { employeeId },
      });
    });

    const safeUser = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
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

    if (!role || typeof role !== "string") {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Use generic message to avoid user enumeration
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    if (!user.role) {
      return errorResponse(res, "User role not found", 500);
    }

    if (user.role.roleName.toLowerCase() !== role.toLowerCase()) {
      return errorResponse(res, "Invalid role selected", 403);
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role.roleName },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, nonce: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
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
    return res.status(500).json({ message: "Login failed" });
  }
};

// REFRESH ACCESS TOKEN
exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Check DB-level expiry
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Fetch user role for inclusion in new access token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || !user.role) {
      return errorResponse(res, "User not found", 404);
    }

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role.roleName },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, nonce: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT USER
exports.logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    };

    res.cookie("accessToken", "", cookieOptions);
    res.cookie("refreshToken", "", cookieOptions);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
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

    if (!user || !user.role) {
      return errorResponse(res, "User not found", 404);
    }

    const safeUser = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.roleName,
    };

    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";

    const whereClause = {
      role: { roleName: "Employee" },
    };

    // MySQL does not support mode:'insensitive' — rely on DB collation
    if (search) {
      whereClause.AND = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { employeeId: { contains: search } },
        ],
      };
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
      role: employee.role?.roleName || "Unknown",
    }));

    res.status(200).json(safeEmployees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

// DELETE EMPLOYEE
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

    // Prevent deletion of admin accounts
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
