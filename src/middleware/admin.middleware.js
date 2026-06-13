const requirePermission = require("./permission.middleware");

module.exports = requirePermission("portal.admin.access");
