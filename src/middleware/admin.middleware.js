const adminMiddleware = (req, res, next) => {
  const role = typeof req.user?.role === "string"
    ? req.user.role
    : req.user?.role?.roleName ?? "";

  if (role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = adminMiddleware;
