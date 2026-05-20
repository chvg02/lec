#!/bin/sh
set -eu

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Ensuring default admin..."
node scripts/ensure-default-admin.cjs

echo "Starting Next.js..."
exec npm run start
