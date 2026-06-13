function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const permissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (!permissions.includes(permissionKey)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
}

module.exports = requirePermission;
