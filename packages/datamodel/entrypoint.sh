#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Run migrations directly using drizzle-kit
cd /app/packages/datamodel
echo "Current working directory: $(pwd)"
echo "Running database migrations..."
# Directly run the drizzle-kit migrate command
bunx drizzle-kit migrate --config=drizzle.config.ts
echo "Migrations complete."

# Start Drizzle Studio, explicitly passing the config file
echo "Starting Drizzle Studio..."
bunx drizzle-kit studio --config=drizzle.config.ts --host 0.0.0.0 --port 59151 