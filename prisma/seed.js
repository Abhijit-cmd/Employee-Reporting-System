const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // SEED ROLES
  await prisma.role.createMany({
    data: [{ roleName: "Admin" }, { roleName: "Employee" }],
    skipDuplicates: true,
  });
  console.log("Roles seeded");

  const adminRole = await prisma.role.findFirst({ where: { roleName: "Admin" } });

  const adminEmail    = process.env.ADMIN_EMAIL    || "admin@constromat.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required to seed admin user");
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      employeeId: "ADMIN001",
      name:       "Admin",
      email:      adminEmail,
      password:   hashedPassword,
      roleId:     adminRole.id,
      phone:      "9876543210",
    },
  });

  console.log("Admin seeded");
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
