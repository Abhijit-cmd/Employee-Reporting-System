
const prisma = require("./src/prisma/prismaClient");
const bcrypt = require("bcrypt");

async function updatePassword() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.update({
      where: { email: "admin@gmail.com" },
      data: { password: hashedPassword },
    });
    console.log("Admin password updated to 'admin123'");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
