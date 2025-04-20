#!/bin/sh
# SPDX-License-Identifier: Apache-2.0

# Debug script to help identify issues with the data service startup

echo "=== Starting entrypoint script ==="
echo "Date: $(date)"

# Print environment variables
echo "=== Environment Variables ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: $DATABASE_URL"

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set"
    exit 1
fi

# Test database connection with retries
echo "Testing database connection..."
max_retries=30
counter=0
while ! pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
    counter=$((counter + 1))
    if [ $counter -ge $max_retries ]; then
        echo "Error: Could not connect to database after $max_retries attempts"
        exit 1
    fi
    echo "Waiting for database to be ready... ($counter/$max_retries)"
    sleep 1
done
echo "Database connection successful!"

echo "=== Listing installed packages for data-service from /app/apps/servers/data_service ==="
(cd /app/apps/servers/data_service && pnpm list --depth=0)
echo "=================================================================================="

echo "=== Starting application from /app/apps/servers/data_service ==="
cd /app/apps/servers/data_service
exec pnpm run dev