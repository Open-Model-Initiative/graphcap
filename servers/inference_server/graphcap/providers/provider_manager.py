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
        logger.info(f"Initializing ProviderManager with config from: {config_path}")
        self.providers = get_providers_config(config_path)
        self._clients: Dict[str, BaseClient] = {}
        logger.info(f"Loaded {len(self.providers)} provider configurations")
        for name, config in self.providers.items():
            logger.info(f"Provider '{name}' configuration:")
            logger.info(f"  - kind: {config.kind}")
            logger.info(f"  - environment: {config.environment}")
            logger.info(f"  - base_url: {config.base_url}")
            logger.info(f"  - default_model: {config.default_model}")
            if config.rate_limits:
                logger.info(f"  - rate_limits: {config.rate_limits}")

    def get_client(self, provider_name: str) -> BaseClient:
        """Get or create a client for the specified provider"""
        if provider_name not in self.providers:
            logger.error(f"Requested unknown provider: {provider_name}")
            logger.debug(f"Available providers: {', '.join(self.providers.keys())}")
            raise ValueError(f"Unknown provider: {provider_name}")

        # Return cached client if available
        if provider_name in self._clients:
            logger.debug(f"Using cached client for provider: {provider_name}")
            return self._clients[provider_name]

        # Create new client
        config = self.providers[provider_name]
        logger.info(f"Initializing new client for provider: {provider_name}")
        logger.info(f"Provider config details:")
        logger.info(f"  - kind: {config.kind}")
        logger.info(f"  - environment: {config.environment}")
        logger.info(f"  - base_url: {config.base_url}")
        logger.info(f"  - default_model: {config.default_model}")
        
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
                logger.debug(f"Setting rate limits for {provider_name} - requests: {config.rate_limits.requests_per_minute}/min, tokens: {config.rate_limits.tokens_per_minute}/min")
                client.requests_per_minute = config.rate_limits.requests_per_minute
                client.tokens_per_minute = config.rate_limits.tokens_per_minute

            self._clients[provider_name] = client
            logger.info(f"Successfully initialized client for provider: {provider_name}")
            return client

        except Exception as e:
            logger.error(f"Failed to initialize client for {provider_name}: {str(e)}")
            logger.error(f"Provider config details:")
            logger.error(f"  - kind: {config.kind}")
            logger.error(f"  - environment: {config.environment}")
            logger.error(f"  - base_url: {config.base_url}")
            logger.error(f"  - default_model: {config.default_model}")
            raise

    def clients(self) -> Dict[str, BaseClient]:
        """Get all initialized clients"""
        logger.debug(f"Returning {len(self._clients)} initialized clients")
        return self._clients.copy()

    def available_providers(self) -> list[str]:
        """Get list of available provider names"""
        providers = list(self.providers.keys())
        logger.debug(f"Available providers: {', '.join(providers)}")
        return providers

    def get_provider_config(self, provider_name: str) -> ProviderConfig:
        """Get configuration for a specific provider"""
        if provider_name not in self.providers:
            logger.error(f"Requested config for unknown provider: {provider_name}")
            raise ValueError(f"Unknown provider: {provider_name}")
        logger.debug(f"Returning config for provider: {provider_name}")
        return self.providers[provider_name] 