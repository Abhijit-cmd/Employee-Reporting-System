
const prisma = require("./src/prisma/prismaClient");
const bcrypt = require("bcrypt");

async function test() {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        role: {
          roleName: "Admin",
        },
      },
      include: { role: true },
    });
    console.log("Admin user found:", admin);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
