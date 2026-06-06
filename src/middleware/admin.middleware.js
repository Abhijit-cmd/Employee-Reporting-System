const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // JWT payload stores role as a string e.g. "Admin"
  const role =
    typeof req.user.role === "string"
      ? req.user.role
      : req.user.role?.roleName ?? "";

  if (role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};

module.exports = adminMiddleware;
