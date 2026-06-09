const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables");
  }

  // SEED ROLES
  await prisma.role.createMany({
    data: [
      { roleName: "Admin" },
      { roleName: "Employee" },
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded successfully");

  const adminRole = await prisma.role.findFirst({
    where: { roleName: "Admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found after seeding — check for DB errors");
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  // SEED ADMIN USER
  await prisma.user.createMany({
    data: [
      {
        employeeId: "SUPER-ADMIN",
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        roleId: adminRole.id,
        phone: "+919876543210",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Admin seeded successfully");

  // SEED REPORT STATUSES
  await prisma.reportStatus.createMany({
    data: [
      { statusName: "Pending" },
      { statusName: "Submitted" },
      { statusName: "Reviewed" },
    ],
    skipDuplicates: true,
  });

  console.log("Statuses inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
