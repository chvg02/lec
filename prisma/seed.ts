import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

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

function envValue(name: string, fallback: string) {
  return String(process.env[name] ?? fallback)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

async function main() {
  const email = envValue("DEFAULT_ADMIN_EMAIL", "vitor.aa01@gmail.com").toLowerCase();
  const password = envValue("DEFAULT_ADMIN_PASSWORD", "12345678");
  const name = envValue(
    "DEFAULT_ADMIN_NAME",
    "Vitor Gabriel Almeida dos Anjos"
  );
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
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
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
