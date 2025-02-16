"""
# SPDX-License-Identifier: Apache-2.0
Database Connection Management

Provides database connection and session management.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator, TypeVar

from fastapi import FastAPI
from loguru import logger
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from .config import settings

T = TypeVar("T")


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


engine: AsyncEngine | None = None
SessionLocal: async_sessionmaker[AsyncSession] | None = None


@retry(
    retry=retry_if_exception_type(Exception),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(5),
)
async def init_db_pool() -> None:
    """Initialize the database connection pool with retry logic."""
    global engine, SessionLocal

    if engine is not None:
        logger.warning("Database pool already initialized")
        return

    try:
        logger.info(f"Connecting to database at {settings.DATABASE_URL}")
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.SQL_DEBUG,
            pool_pre_ping=True,
            pool_size=20,  # Increased pool size
            max_overflow=10,  # Allow some overflow
        )

        # Test the connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))

        SessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=True,  # Enable autoflush
        )
        logger.info("Database pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {e}")
        raise


async def init_app_db(app: FastAPI) -> None:
    """Initialize database and attach session maker to app state."""
    await init_db_pool()
    if engine is None or SessionLocal is None:
        raise RuntimeError("Failed to initialize database")
    app.state.db_session = SessionLocal


@asynccontextmanager
async def managed_transaction() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for handling database transactions with automatic rollback on error.

    Yields:
        AsyncSession: Database session with transaction management
    """
    if SessionLocal is None:
        await init_db_pool()
        if SessionLocal is None:
            raise RuntimeError("Failed to initialize database session")

    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Transaction failed, rolling back: {e}")
            raise
        except Exception as e:
            await session.rollback()
            logger.error(f"Unexpected error in transaction, rolling back: {e}")
            raise
        finally:
            await session.close()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get a database session."""
    if SessionLocal is None:
        await init_db_pool()
        if SessionLocal is None:
            raise RuntimeError("Failed to initialize database session")

    session = SessionLocal()
    try:
        yield session
    finally:
        # Only close if session hasn't been closed already
        if session.is_active:
            await session.close()


async def run_in_transaction(operation: T) -> T:
    """
    Run an operation in a transaction with automatic rollback on error.

    Args:
        operation: Async operation to run in transaction

    Returns:
        Result of the operation

    Raises:
        Exception: If operation fails
    """
    async with managed_transaction() as session:
        try:
            result = await operation
            return result
        except Exception as e:
            logger.error(f"Operation failed in transaction: {e}")
            raise
