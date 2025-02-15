"""
# SPDX-License-Identifier: Apache-2.0
Server Configuration

Manages server configuration settings using Pydantic.
"""

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Server configuration settings."""

    # Database settings
    DATABASE_URL: str = "postgresql+asyncpg://graphcap:graphcap@gcap_postgres:5432/graphcap"

    # Job settings
    MAX_CONCURRENT_JOBS: int = 5
    JOB_TIMEOUT_SECONDS: int = 3600  # 1 hour default timeout

    # Debug settings
    SQL_DEBUG: bool = False

    DATASETS_PATH: Path = Path("/datasets")
    CONFIG_PATH: Path = Path("/config")
    PROVIDER_CONFIG_PATH: Optional[Path] = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # If provider config not set, default to config directory
        if not self.PROVIDER_CONFIG_PATH:
            self.PROVIDER_CONFIG_PATH = self.CONFIG_PATH / "provider.config.toml"

    class Config:
        """Pydantic config."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
