const prisma = require("../prisma/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const errorResponse = (res, message, status) => res.status(status).json({ message });

// Registration disabled — employees are created by admin only.
// exports.registerUser = async (req, res) => { ... };

exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!role || typeof role !== "string") return res.status(400).json({ message: "Role is required" });

    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.status === "inactive") return res.status(403).json({ message: "Account is inactive" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid credentials", 401);
    if (!user.role) return errorResponse(res, "User role not found", 500);
    if (user.role.roleName.toLowerCase() !== role.toLowerCase()) return errorResponse(res, "Invalid role selected", 403);

    const accessToken = jwt.sign({ id: user.id, role: user.role.roleName }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id, nonce: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, employeeId: user.employeeId, name: user.name, email: user.email, phone: user.phone, role: user.role.roleName },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken) return res.status(403).json({ message: "Invalid refresh token" });

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { role: true } });
    if (!user || !user.role) return errorResponse(res, "User not found", 404);

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const accessToken = jwt.sign({ id: user.id, role: user.role.roleName }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign({ id: user.id, nonce: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error(error);
    try {
      if (req.cookies.refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: req.cookies.refreshToken } });
      }
    } catch { /* ignore cleanup errors */ }
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

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

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!user || !user.role) return errorResponse(res, "User not found", 404);

    res.status(200).json({
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.roleName,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
