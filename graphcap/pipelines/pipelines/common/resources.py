# SPDX-License-Identifier: Apache-2.0
"""Shared resources for pipeline operations."""

import dagster as dg


class PostgresConfig(dg.ConfigurableResource):
    """Configuration for Postgres connections."""

    host: str = "graphcap_postgres"
    port: int = 5432
    database: str = "graphcap"
    user: str = "graphcap"
    password: str = "graphcap"


class FileSystemConfig(dg.ConfigurableResource):
    """Configuration for file system operations."""

    workspace_dir: str = "/workspace"
    dataset_dir: str = "/workspace/datasets"
    output_dir: str = "/workspace/.local/output"


class ProviderConfigFile(dg.ConfigurableResource):
    """Configuration for provider operations."""

    provider_config: str = "/workspace/config/provider.config.toml"
    default_provider: str = "gemini"
