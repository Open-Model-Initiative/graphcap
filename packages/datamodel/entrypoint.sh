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

# Start Drizzle Studio only in development, explicitly passing the config file
if [ "$NODE_ENV" = "development" ]; then
    echo "Starting Drizzle Studio..."
    # Use pnpm run to execute the script defined in package.json, passing host/port
    pnpm run db:studio -- --host 0.0.0.0 --port 53151 &
    echo "Drizzle Kit Studio started in background on 0.0.0.0:53151"
else
    echo "Not starting Drizzle Studio as NODE_ENV is not 'development'"
fi

echo "Datamodel entrypoint script finished." 