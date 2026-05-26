/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

function configureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;

  const user = encodeURIComponent(envValue("POSTGRES_USER", "postgres"));
  const password = encodeURIComponent(envValue("POSTGRES_PASSWORD", "postgres"));
  const host = envValue("POSTGRES_HOST", "db");
  const port = envValue("POSTGRES_PORT", "5432");
  const database = encodeURIComponent(envValue("POSTGRES_DB", "lec_facom"));
  const schema = encodeURIComponent(envValue("POSTGRES_SCHEMA", "public"));

  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=${schema}`;
}

configureDatabaseUrl();

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
    const isPasswordAlreadyCurrent = await bcrypt.compare(password, existingAdmin.password);

    await prisma.user.update({
      where: { email },
      data: {
        name,
        ...(shouldResetPassword ? { password: hashedPassword } : {}),
        role: "admin",
        ...ADMIN_PERMISSIONS,
      },
    });

    if (shouldResetPassword) {
      console.log(`Default admin password reset: ${email}`);
    } else if (isPasswordAlreadyCurrent) {
      console.log(`Default admin already exists with current password: ${email}`);
    } else {
      console.log(
        `Default admin already exists, password was not changed because DEFAULT_ADMIN_RESET_PASSWORD=false: ${email}`
      );
    }
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
