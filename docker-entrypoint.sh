#!/bin/sh
set -e

# Apply any pending Prisma migrations before starting the server.
# DATABASE_URL is injected at runtime (Easypanel env) and read via prisma.config.ts.
echo "[entrypoint] Running prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Starting Next.js server..."
exec node server.js
