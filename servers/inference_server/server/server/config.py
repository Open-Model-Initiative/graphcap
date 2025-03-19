"""
# SPDX-License-Identifier: Apache-2.0
Server Configuration

Manages server configuration settings using Pydantic.
"""

import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Server configuration settings."""

    # Database connection parameters from environment variables
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str

    # Database URL (constructed in __init__ if not provided)
    DATABASE_URL: Optional[str] = None

    # Job settings
    MAX_CONCURRENT_JOBS: int = 5
    JOB_TIMEOUT_SECONDS: int = 3600  # 1 hour default timeout

    # Debug settings
    SQL_DEBUG: bool = False

    # Path settings
    DATASETS_PATH: Path = Path("/datasets")
    CONFIG_PATH: Path = Path("/workspace/config")
    PROVIDER_CONFIG_PATH: Optional[Path] = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # If provider config not set, default to config directory
        if not self.PROVIDER_CONFIG_PATH:
            self.PROVIDER_CONFIG_PATH = self.CONFIG_PATH / "provider.config.toml"

        # Construct DATABASE_URL if not provided
        if not self.DATABASE_URL:
            self.DATABASE_URL = f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        """Pydantic config."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
