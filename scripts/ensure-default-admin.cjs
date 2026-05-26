/* eslint-disable @typescript-eslint/no-require-imports */
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

function envValue(name, fallback) {
  return String(process.env[name] ?? fallback)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

async function main() {
  const email = envValue("DEFAULT_ADMIN_EMAIL", "vitor.a.anjos@ufms.br").toLowerCase();
  const password = envValue("DEFAULT_ADMIN_PASSWORD", "Echvgme0406#");
  const name = envValue(
    "DEFAULT_ADMIN_NAME",
    "vitor anjos"
  );
  const shouldResetPassword =
    envValue("DEFAULT_ADMIN_RESET_PASSWORD", "false").toLowerCase() === "true";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        ...(shouldResetPassword ? { password: hashedPassword } : {}),
        role: "admin",
        ...ADMIN_PERMISSIONS,
      },
    });

    console.log(`Default admin already exists: ${email}`);
    return;
  }

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
