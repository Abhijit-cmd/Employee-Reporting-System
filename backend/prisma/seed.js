const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {

  // =========================
  // SEED ROLES
  // =========================
  await prisma.role.createMany({
    data: [
      {
        roleName: "Admin",
      },
      {
        roleName: "Employee",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded successfully");

  // =========================
  // GET ADMIN ROLE
  // =========================
  const adminRole = await prisma.role.findFirst({
    where: {
      roleName: "Admin",
    },
  });

  // =========================
  // HASH PASSWORD
  // =========================
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // =========================
  // SEED ADMIN USER
  // =========================
  await prisma.user.createMany({
    data: [
      {
        employeeId: "ADMIN001",
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        roleId: adminRole.id,
        phone: "9876543210",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Admin seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);

    await prisma.$disconnect();

    process.exit(1);
  });