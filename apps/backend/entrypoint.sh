#!/bin/sh
set -e

cd /app/apps/backend

echo "Running database migrations..."
bunx drizzle-kit migrate
echo "Migrations complete."

echo "Starting server..."
exec bun dist/index.js
