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

# Function to clean install dependencies
clean_install() {
    log "Performing clean dependency installation..."
    
    # Remove existing node_modules if they exist
    if [ -d "node_modules" ]; then
        log "Removing existing node_modules..."
        rm -rf node_modules
    fi
    
    # Clear pnpm store
    log "Clearing pnpm store..."
    pnpm store prune
    
    # Install dependencies with frozen lockfile
    log "Installing dependencies..."
    pnpm install --frozen-lockfile || {
        error "Failed to install dependencies"
        return 1
    }
    
    # Verify vite installation
    if ! pnpm list vite > /dev/null 2>&1; then
        log "Installing vite..."
        pnpm add -D vite || {
            error "Failed to install vite"
            return 1
        }
    fi
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
    
    # Perform clean install
    # clean_install || exit 1
        log "Installing dependencies..."
    pnpm install --frozen-lockfile || {
        error "Failed to install dependencies"
        return 1
    }
    log "✅ All checks passed"
    log "🚀 Starting development server..."
    
    if [ "$NODE_ENV" = "production" ]; then
        pnpm run build && pnpm run preview
    else
        # Use exec to replace shell with node process
        exec pnpm run dev
    fi
}

# Trap errors
trap 'error "An error occurred. Exiting..."; exit 1' ERR

# Run main with error handling
main "$@" || {
    error "Startup failed"
    exit 1
}
