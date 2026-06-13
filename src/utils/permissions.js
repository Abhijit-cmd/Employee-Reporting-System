const prisma = require("../prisma/prismaClient");

async function getPermissionKeysForRole(roleId) {
  const rows = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: { select: { key: true } } },
  });
  return rows.map((r) => r.permission.key);
}

module.exports = { getPermissionKeysForRole };
