"""
# SPDX-License-Identifier: Apache-2.0
Main Server Entry Point

Configures and starts the FastAPI server application.
"""

import asyncio
import signal
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_app_db
from .routers import main_router
from .utils.logger import logger
from .utils.middleware import setup_middlewares


class GracefulExit(SystemExit):
    """Custom exception for graceful shutdown."""

    pass


def handle_sigterm(*_: Any) -> None:
    """Handle SIGTERM signal."""
    raise GracefulExit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the FastAPI application.

    Handles startup and shutdown events.
    """
    # Setup signal handlers
    signal.signal(signal.SIGINT, handle_sigterm)
    signal.signal(signal.SIGTERM, handle_sigterm)

    retries = 5
    retry_delay = 5  # seconds

    # Startup
    try:
        for attempt in range(retries):
            try:
                # Initialize database
                await init_app_db(app)
                logger.info("Database initialized")

            except GracefulExit:
                logger.info("Received shutdown signal during startup")
                raise
            except Exception as e:
                if attempt < retries - 1:
                    logger.warning(f"Startup attempt {attempt + 1} failed: {e}")
                    logger.info(f"Retrying in {retry_delay} seconds... (Press Ctrl+C to cancel)")
                    try:
                        await asyncio.sleep(retry_delay)
                    except asyncio.CancelledError:
                        logger.info("Startup cancelled by user")
                        raise GracefulExit()
                else:
                    logger.error(f"All startup attempts failed: {e}")
                    raise
    except GracefulExit:
        logger.info("Shutting down during startup")
        raise

    yield

    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title="graphcap Server",
    description="API server for graphcap image processing and graph generation",
    version="0.0.2",
    lifespan=lifespan,
)

# Set up middleware
setup_middlewares(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
