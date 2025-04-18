"""
# SPDX-License-Identifier: Apache-2.0
FastAPI Dependencies

Provides dependency injection for FastAPI routes.
"""

from typing import AsyncGenerator

from asyncpg.pool import Pool

from .db import get_session


async def get_db_pool() -> AsyncGenerator[Pool, None]:
    """Get database connection pool."""
    pool = None
    try:
        pool = await anext(get_session())
        yield pool
    finally:
        if pool:
            await pool.close()
