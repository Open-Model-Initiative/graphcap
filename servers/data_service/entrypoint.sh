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

# Database setup
echo "=== Database Setup ==="

# Push schema changes directly to database
echo "Pushing schema changes..."
if ! bunx drizzle-kit migrate --config=drizzle.config.ts; then
    echo "Error: Failed to migrate schema changes"
    # Try to get more information about the database state
    echo "Current database tables:"
    psql "$DATABASE_URL" -c "\dt" 2>&1 || echo "Could not list tables"
    exit 1
fi

# Run seed scripts if in development environment
if [ "$NODE_ENV" = "development" ]; then
    echo "=== Running Seed Scripts ==="
    if ! bun run seed; then
        echo "Warning: Seed script failed, but continuing startup"
    fi
    
    echo "=== Starting Drizzle Kit Studio ==="
    # Start Drizzle Kit Studio in the background with host 0.0.0.0 for external access
    bunx drizzle-kit studio --host 0.0.0.0 --port 32501 --config=drizzle.config.ts & 
    echo "Drizzle Kit Studio started on 0.0.0.0:32501"
fi

echo "Database setup completed successfully"

# Start the application
echo "=== Starting application ==="
exec bun run dev