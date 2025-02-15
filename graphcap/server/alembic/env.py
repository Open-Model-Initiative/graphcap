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

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Import Base and all models
from server.db import Base
from server.models import *

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
DB_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://graphcap:graphcap@gcap_postgres:5432/graphcap")

def do_run_migrations(connection: Connection) -> None:
    """Run migrations in offline/online modes."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Run migrations in 'async' mode."""
    configuration = config.get_section(config.config_ini_section)
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
