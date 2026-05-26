#!/bin/sh
set -eu

validate_nextauth_url() {
  node - <<'NODE'
const value = process.env.NEXTAUTH_URL;

if (!value) {
  console.error("NEXTAUTH_URL is required. Example: https://seu-dominio.com");
  process.exit(1);
}

try {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("invalid protocol");
  }
} catch {
  console.error(
    `Invalid NEXTAUTH_URL: ${value}. Use the full URL with http:// or https://.`
  );
  process.exit(1);
}
NODE
}

configure_database_url() {
  if [ -n "${DATABASE_URL:-}" ]; then
    export DATABASE_URL
    return
  fi

  DATABASE_URL="$(node - <<'NODE'
const user = encodeURIComponent(process.env.POSTGRES_USER || "postgres");
const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || "postgres");
const host = process.env.POSTGRES_HOST || "db";
const port = process.env.POSTGRES_PORT || "5432";
const database = encodeURIComponent(process.env.POSTGRES_DB || "lec_facom");
const schema = encodeURIComponent(process.env.POSTGRES_SCHEMA || "public");

process.stdout.write(
  `postgresql://${user}:${password}@${host}:${port}/${database}?schema=${schema}`
);
NODE
)"

  export DATABASE_URL
}

wait_for_database() {
  echo "Waiting for database..."

  until node - <<'NODE'
const net = require("net");

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const url = new URL(rawUrl);
const socket = net.createConnection({
  host: url.hostname,
  port: Number(url.port || 5432),
});

socket.setTimeout(3000);
socket.on("connect", () => {
  socket.end();
  process.exit(0);
});
socket.on("timeout", () => {
  socket.destroy();
  process.exit(1);
});
socket.on("error", () => process.exit(1));
NODE
  do
    sleep 2
  done
}

validate_nextauth_url
configure_database_url
wait_for_database

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Applying Prisma migrations..."
  npx prisma migrate deploy
fi

if [ "${ENSURE_DEFAULT_ADMIN:-true}" = "true" ]; then
  echo "Ensuring default admin..."
  npx prisma db seed
fi

echo "Starting Next.js..."
exec npm run start -- --hostname "${HOSTNAME:-0.0.0.0}"
