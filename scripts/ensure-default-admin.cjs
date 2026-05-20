const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || "vitor.a.anjos@gmail.com";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "123456";
  const name = process.env.DEFAULT_ADMIN_NAME || "Vitor Anjos";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "admin",
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`Default admin ready: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to ensure default admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
