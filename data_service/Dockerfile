# SPDX-License-Identifier: Apache-2.0
FROM oven/bun:1.0-debian AS base

WORKDIR /app

# Install basic utilities and PostgreSQL client
RUN apt-get update && apt-get install -y \
    lsof \
    net-tools \
    postgresql-client \
    procps \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy source code
COPY . .

# Build and verify
RUN chmod +x /app/entrypoint.sh && \
    mkdir -p dist && \
    bun run build && \
    ls -la dist/

# Expose ports
EXPOSE 32550
EXPOSE 32501

# Use our debug entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"] 