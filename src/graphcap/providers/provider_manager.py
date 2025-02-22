"""
# SPDX-License-Identifier: Apache-2.0
Provider Manager Module

This module handles provider lifecycle management and client initialization.

Key features:
- Provider configuration loading
- Client initialization and caching
- Environment validation
- Rate limit management

Classes:
    ProviderManager: Main provider management class
"""

from pathlib import Path
from typing import Dict

from loguru import logger

from .clients import BaseClient, get_client
from .provider_config import get_providers_config
from .types import ProviderConfig


class ProviderManager:
    """Manager class for handling provider lifecycle and client initialization"""

    def __init__(self, config_path: str | Path):
        """Initialize provider manager with configuration file"""
        self.providers = get_providers_config(config_path)
        self._clients: Dict[str, BaseClient] = {}

    def get_client(self, provider_name: str) -> BaseClient:
        """Get or create a client for the specified provider"""
        if provider_name not in self.providers:
            raise ValueError(f"Unknown provider: {provider_name}")

        # Return cached client if available
        if provider_name in self._clients:
            return self._clients[provider_name]

        # Create new client
        config = self.providers[provider_name]
        try:
            client = get_client(
                name=provider_name,
                kind=config.kind,
                environment=config.environment,
                env_var=config.env_var,
                base_url=config.base_url,
                default_model=config.default_model,
            )

            # Set rate limits if configured
            if config.rate_limits:
                client.requests_per_minute = config.rate_limits.requests_per_minute
                client.tokens_per_minute = config.rate_limits.tokens_per_minute

            self._clients[provider_name] = client
            return client

        except Exception as e:
            logger.error(f"Failed to initialize client for {provider_name}: {str(e)}")
            raise

    def clients(self) -> Dict[str, BaseClient]:
        """Get all initialized clients"""
        return self._clients.copy()

    def available_providers(self) -> list[str]:
        """Get list of available provider names"""
        return list(self.providers.keys())

    def get_provider_config(self, provider_name: str) -> ProviderConfig:
        """Get configuration for a specific provider"""
        if provider_name not in self.providers:
            raise ValueError(f"Unknown provider: {provider_name}")
        return self.providers[provider_name] 