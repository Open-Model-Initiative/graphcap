"""
# SPDX-License-Identifier: Apache-2.0
Alembic Environment Configuration
"""

# aidriver_datamodel/migrations/env.py
import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path
from typing import Dict, Any

from alembic import context

# Import Base and all models
from server.db import Base
from server.models import *
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Add the server directory to Python path
server_dir = str(Path(__file__).parent.parent.absolute())
if server_dir not in sys.path:
    sys.path.append(server_dir)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Get database connection parameters from environment variables
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")
DB_NAME = os.getenv("POSTGRES_DB")

# Construct the database URL from environment variables or use DATABASE_URL directly
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL and all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
    DB_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

if not DB_URL:
    raise ValueError("DATABASE_URL or all database connection parameters must be provided in environment variables")

def do_run_migrations(connection: Connection) -> None:
    """Run migrations in offline/online modes."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Run migrations in 'async' mode."""
    configuration = config.get_section(config.config_ini_section) or {}
    configuration = dict(configuration)  # Ensure it's a dictionary
    
    # At this point, DB_URL is guaranteed to be a string (not None) due to the check above
    assert DB_URL is not None, "DB_URL should not be None at this point"
    configuration["sqlalchemy.url"] = DB_URL

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = DB_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
