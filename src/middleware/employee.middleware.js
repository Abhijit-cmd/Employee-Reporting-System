const employeeMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const role =
    typeof req.user?.role === "string"
      ? req.user.role
      : req.user?.role?.roleName ?? "";

  if (role.toLowerCase() !== "employee") {
    return res.status(403).json({ message: "Access denied. Employees only." });
  }

  next();
};

module.exports = employeeMiddleware;
