#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Run migrations directly using drizzle-kit
cd /app/packages/datamodel
echo "Current working directory: $(pwd)"
echo "Running database migrations..."
# Directly run the drizzle-kit migrate command
# Use pnpm to ensure it uses the workspace version and config
pnpm run db:migrate 
echo "Migrations complete."

echo "Starting Drizzle Studio..."
# Use pnpm run to execute the script defined in package.json, passing host/port
pnpm run db:studio 
echo "Drizzle Kit Studio started in background on 0.0.0.0:32151"
tail -f /dev/null