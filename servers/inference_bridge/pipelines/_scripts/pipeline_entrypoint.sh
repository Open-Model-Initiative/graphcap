#!/bin/bash
# SPDX-License-Identifier: Apache-2.0

set -e  # Exit on error

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to log errors
error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1" >&2
}

# Function to wait for postgres
wait_for_postgres() {
    log "Waiting for PostgreSQL..."
    until PGPASSWORD=graphcap psql -h graphcap_postgres -U graphcap -d graphcap -c '\q'; do
        log "PostgreSQL is unavailable - sleeping"
        sleep 1
    done
    log "PostgreSQL is up"
}

# Function to check if dependencies need updating
check_dependencies() {
    # Only check dependencies if we're in development mode
    if [ "$NODE_ENV" != "production" ]; then
        log "Checking if dependencies need updating..."
        
        # Create new hash of current dependency files
        local NEW_HASH=$(cat /app/pipelines/pyproject.toml | md5sum)
        local OLD_HASH=""
        
        if [ -f /app/pipelines/.dep_hash ]; then
            OLD_HASH=$(md5sum /app/pipelines/.dep_hash | cut -d' ' -f1)
        fi
        
        # Compare hashes
        if [ "$NEW_HASH" != "$OLD_HASH" ]; then
            log "Dependencies changed, updating..."
            update_dependencies || return 1
        else
            log "Dependencies up to date"
        fi
    fi
}

# Function to install/update dependencies
update_dependencies() {
    log "Updating dependencies..."
    cd /app/pipelines && \
    uv pip install -e ".[dev]" || {
        error "Failed to install dependencies"
        return 1
    }
    
    # Update dependency hash
    cat /app/pipelines/pyproject.toml > /app/pipelines/.dep_hash
    
    log "✅ Dependencies updated successfully"
}

# Function to check Python environment
check_environment() {
    log "🔍 Checking Python environment..."
    log "Python path: $(which python)"
    log "Virtual env: $VIRTUAL_ENV"
    log "Installed packages:"
    pip list
}

# Function to check the environment variables
environment_check() {
    log "🔍 Checking environment variables..."
    if [ -z "$HUGGING_FACE_HUB_TOKEN" ]; then
        log "HUGGING_FACE_HUB_TOKEN: Not set"
    else
        log "HUGGING_FACE_HUB_TOKEN: Set"
    fi
}

# Function to setup Dagster environment
setup_dagster() {
    # Set Dagster home if not set
    if [ -z "$DAGSTER_HOME" ]; then
        export DAGSTER_HOME="/workspace/.local/.dagster"
        log "Setting DAGSTER_HOME to $DAGSTER_HOME"
    fi
    
    # Ensure Dagster directory exists with proper permissions
    mkdir -p "$DAGSTER_HOME"
    chmod -R 777 "$DAGSTER_HOME"

    # Copy the dagster config file to the Dagster home directory
    cp /app/pipelines/dagster.example.yml "$DAGSTER_HOME/dagster.yaml"
    log "Copied dagster config file"

    # Create workspace directory for Unix sockets
    mkdir -p /tmp/dagster_grpc
    chmod -R 777 /tmp/dagster_grpc
}

# Main startup sequence
main() {
    log "🚀 Starting pipeline service..."

    # Check environment variables
    environment_check

    # Check environment, dependencies, wait for Postgres, and setup Dagster
    check_environment
    check_dependencies || exit 1
    wait_for_postgres
    setup_dagster
    mkdir -p /workspace/logs && chmod -R 777 /workspace/logs

    PORT=$DAGSTER_PORT
    log "Starting Dagster webserver..."

    # Do not change directory so that the PYTHONPATH remains correct.
    export DAGSTER_CURRENT_IMAGE="gcap_pipelines"
    export PYTHONPATH="/app/pipelines:${PYTHONPATH}"
    export DAGSTER_GRPC_SOCKET_DIR="/tmp/dagster_grpc"
    
    # Redirect output to pipeline_startup.log
    exec > >(tee -a /workspace/logs/gcap_pipelines/startup.log) 2>&1
    exec uv run --active dagster dev -h 0.0.0.0 -p $PORT -m pipelines.definitions
}

# Trap errors
trap 'error "An error occurred. Exiting..."; exit 1' ERR

# Run main with error handling
main "$@" || {
    error "Startup failed"
    exit 1
}
