#!/bin/sh
# SPDX-License-Identifier: Apache-2.0

# Ensure logs directory exists and redirect all output to the log file in the mounted log volume
mkdir -p /workspace/logs
exec > >(tee -a /workspace/logs/ui_client.log) 2>&1

set -e  # Exit on error

echo "🚀 Starting UI client entrypoint script..."

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to log errors
error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1" >&2
}

# Verify environment variables
check_env() {
    log "Checking environment variables..."
    : "${NODE_ENV:?Required environment variable NODE_ENV not set}"
    : "${VITE_API_URL:?Required environment variable VITE_API_URL not set}"
    
    log "✅ Environment: $NODE_ENV"
    log "✅ API URL: $VITE_API_URL"
}

# Main startup sequence
main() {
    log "🔍 Starting pre-flight checks..."
    
    # Check environment first
    check_env || exit 1
    
    # Install dependencies if node_modules doesn't exist or if package.json has changed
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log "Installing dependencies..."
        pnpm install || {
            error "Failed to install dependencies"
            return 1
        }
    else
        log "✅ Dependencies already installed"
    fi
    
    log "✅ All checks passed"
    
    if [ "$NODE_ENV" = "production" ]; then
        log "🚀 Building for production..."
        pnpm run build && pnpm run preview
    else
        log "🚀 Starting development server with HMR enabled..."
        # Use exec to replace shell with node process for proper signal handling
        exec pnpm run dev -- --host 0.0.0.0 --port 32200
    fi
}

# Trap signals for proper shutdown
trap 'log "Received SIGINT or SIGTERM. Shutting down..."; exit 0' INT TERM

# Run main with error handling
main "$@" || {
    error "Startup failed"
    exit 1
}
