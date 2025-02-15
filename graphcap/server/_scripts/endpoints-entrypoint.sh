#!/bin/bash
# SPDX-License-Identifier: Apache-2.0

# Ensure logs directory exists and redirect all output to the log file
mkdir -p /workspace/logs
exec > >(tee -a /workspace/logs/uvicorn_server.log) 2>&1

set -e  # Exit on error

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to log errors
error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1" >&2
}

# Function to check and setup virtual environment
setup_venv() {
    log "Setting up Python virtual environment..."
    cd /app/server
    
    echo "Current directory: $(pwd)"
    echo "Contents of current directory:"
    ls -la
    
    # Check if venv exists and is activated
    if [ -d ".venv" ] && [ -n "$VIRTUAL_ENV" ]; then
        log "✅ Virtual environment already active at: $VIRTUAL_ENV"
        return 0
    fi
    
    # If .venv doesn't exist or is empty, create it
    if [ ! -d ".venv" ] || [ ! -f ".venv/bin/activate" ]; then
        log "Creating new virtual environment..."
        rm -rf .venv 2>/dev/null  # Clean up any partial venv
        uv venv && \
        uv pip install -e . || {
            error "Failed to create virtual environment"
            return 1
        }
    fi
    
    # Activate the venv
    if [ -f ".venv/bin/activate" ]; then
        log "Activating virtual environment..."
        echo "Contents of .venv/bin:"
        ls -la .venv/bin
        source .venv/bin/activate || {
            error "Failed to activate virtual environment"
            return 1
        }
    else
        error "Virtual environment creation failed - activate script not found"
        echo "Looking for activate script:"
        find .venv -name activate 2>/dev/null || echo "No activate script found"
        return 1
    fi
    
    log "✅ Virtual environment ready at: $VIRTUAL_ENV"
    return 0
}

# Function to check if dependencies need updating
check_dependencies() {
    # Only check dependencies if we're in development mode
    if [ "$NODE_ENV" != "production" ]; then
        log "Checking if dependencies need updating..."
        
        # Create new hash of current dependency files
        local NEW_HASH=$(md5sum /app/server/pyproject.toml | cut -d' ' -f1)
        local OLD_HASH=""
        
        if [ -f /app/server/.dep_hash ]; then
            OLD_HASH=$(cat /app/server/.dep_hash)
        fi
        
        # Compare hashes
        if [ "$NEW_HASH" != "$OLD_HASH" ]; then
            log "Dependencies changed, updating..."
            update_dependencies || return 1
            echo "$NEW_HASH" > /app/server/.dep_hash
        else
            log "Dependencies up to date"
        fi
    fi
}

# Function to install/update dependencies
update_dependencies() {
    log "Updating dependencies..."
    
    # Ensure we're in the right directory
    cd /app/server
    
    log "Installing package in editable mode..."
    uv pip install -e . || {
        error "Failed to install package"
        return 1
    }
    
    log "✅ Dependencies updated successfully"
}

# Add this after the log function
check_environment() {
    log "🔍 Checking Python environment..."
    log "Python path: $(which python)"
    log "Python version: $(python --version)"
    log "Virtual env path: $VIRTUAL_ENV"
    log "Current directory: $(pwd)"
    log "Directory contents:"
    ls -la
    log "Installed packages:"
    uv pip list || {
        error "Failed to list packages"
        return 1
    }
}

# Main startup sequence
main() {
    cd /app/server
    
    log "🔍 Starting pre-flight checks..."
    
    # Setup virtual environment first
    setup_venv || exit 1
    
    # Check environment after venv setup
    check_environment || exit 1
    
    # Check dependencies only in development
    if [ "$NODE_ENV" != "production" ]; then
        check_dependencies || exit 1
    fi
    
    # Wait for services to initialize
    log "Waiting for services..."
    sleep 5
    
    log "Starting uvicorn server..."
    exec python -m uvicorn server.main:app \
        --host 0.0.0.0 \
        --port 32100 \
        --reload \
        --reload-dir /app/server/server
}

# Trap errors
trap 'error "An error occurred. Exiting..."; exit 1' ERR

# Run main with error handling
main "$@" || {
    error "Startup failed"
    exit 1
}
