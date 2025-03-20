#!/bin/sh
# SPDX-License-Identifier: Apache-2.0

# Debug script to help identify issues with the message broker startup

echo "=== Starting message broker entrypoint script ==="
echo "Date: $(date)"

# Print environment variables
echo "=== Environment Variables ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "RABBITMQ_HOST: $RABBITMQ_HOST"
echo "RABBITMQ_PORT: $RABBITMQ_PORT"

# Make sure port is available
echo "Checking if port $PORT is available..."
if lsof -i :"$PORT" > /dev/null 2>&1; then
  echo "Error: Port $PORT is already in use."
  echo "Please make sure no other service is using this port."
  lsof -i :"$PORT" 2>&1 || echo "Could not get details about port usage"
  exit 1
fi
echo "Port $PORT is available."

# Test RabbitMQ connection with retries
echo "Testing RabbitMQ connection..."
max_retries=30
counter=0
while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT" >/dev/null 2>&1; do
    counter=$((counter + 1))
    if [ $counter -ge $max_retries ]; then
        echo "Error: Could not connect to RabbitMQ after $max_retries attempts"
        exit 1
    fi
    echo "Waiting for RabbitMQ to be ready... ($counter/$max_retries)"
    sleep 1
done
echo "RabbitMQ connection successful!"

# Start the application
echo "=== Starting message broker application ==="
exec bun --hot src/index.ts 