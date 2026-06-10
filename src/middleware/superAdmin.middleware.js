const superAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const role =
    typeof req.user?.role === "string"
      ? req.user.role
      : req.user?.role?.roleName ?? "";

  if (role.toLowerCase() !== "superadmin") {
    return res.status(403).json({ message: "Access denied. Super Admin only." });
  }

  next();
};

module.exports = superAdminMiddleware;
