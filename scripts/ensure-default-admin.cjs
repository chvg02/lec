const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ADMIN_PERMISSIONS = {
  canManageProjects: true,
  canManageNews: true,
  canManageEvents: true,
  canManageResources: true,
  canManageUsers: true,
  canEditContact: true,
  canEditAbout: true,
};

async function main() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || "vitor.aa01@gmail.com")
    .trim()
    .toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "12345678";
  const name =
    process.env.DEFAULT_ADMIN_NAME || "Vitor Gabriel Almeida dos Anjos";

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        role: "admin",
        ...ADMIN_PERMISSIONS,
      },
    });

    console.log(`Default admin already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "admin",
      ...ADMIN_PERMISSIONS,
    },
  });

  console.log(`Default admin created: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to ensure default admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
