# Main startup sequence
main() {
    log "🔍 Starting pre-flight checks..."
    
    # Check environment
    log "Checking environment variables..."
    if [ -z "$NODE_ENV" ]; then
        error "NODE_ENV is not set"
        exit 1
    fi
    if [ -z "$VITE_API_URL" ]; then
        error "VITE_API_URL is not set"
        exit 1
    fi
    
    log "✅ Environment: $NODE_ENV"
    log "✅ API URL: $VITE_API_URL"
    
    # Smart dependency check: persist node_modules unless dependency files change.
    NODE_MODULES_HASH_FILE=".node_modules_hash"
    HASH_SOURCE_FILES="package.json pnpm-lock.yaml"
    
    compute_hash() {
        # Compute a hash of the dependency files. Using md5sum with concatenated content.
        cat $HASH_SOURCE_FILES 2>/dev/null | md5sum | awk '{print $1}'
    }
    
    current_hash=$(compute_hash)
    
    if [ ! -d "node_modules" ]; then
        log "node_modules not found, installing dependencies..."
        pnpm install --frozen-lockfile || {
            error "Failed to install dependencies"
            exit 1
        }
        echo "$current_hash" > $NODE_MODULES_HASH_FILE
    elif [ ! -f "$NODE_MODULES_HASH_FILE" ]; then
        log "Dependency hash file not found, installing dependencies..."
        pnpm install --frozen-lockfile || {
            error "Failed to install dependencies"
            exit 1
        }
        echo "$current_hash" > $NODE_MODULES_HASH_FILE
    else
        stored_hash=$(cat $NODE_MODULES_HASH_FILE)
        if [ "$current_hash" != "$stored_hash" ]; then
            log "Dependency files changed, updating dependencies..."
            pnpm install --frozen-lockfile || {
                error "Failed to update dependencies"
                exit 1
            }
            echo "$current_hash" > $NODE_MODULES_HASH_FILE
        else
            log "Dependencies are up-to-date."
        fi
    fi
    
    log "✅ Dependencies installed"
    
    # Start the appropriate server
    if [ "$NODE_ENV" = "production" ]; then
        log "Starting production server..."
        pnpm run build && pnpm run preview
    else
        log "Starting development server..."
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