#!/bin/sh
set -eu

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Ensuring default admin..."
npx prisma db seed

echo "Starting Next.js..."
exec npm run start
