"""
# SPDX-License-Identifier: Apache-2.0
Provider Factory Module

This module provides factory functionality for creating provider clients.

Key features:
- Client instantiation
- Environment validation
- Rate limit configuration
- Client caching
"""

from typing import Dict, Optional

from loguru import logger

from .clients import BaseClient, get_client


class ProviderFactory:
    """Factory class for creating provider clients with specific configurations"""

    def __init__(self):
        """Initialize provider factory"""
        logger.info("Initializing ProviderFactory")
        self._client_cache: Dict[str, BaseClient] = {}

    def create_client(
        self,
        name: str,
        kind: str,
        environment: str,
        base_url: str,
        api_key: str,
        rate_limits: Optional[dict] = None,
        use_cache: bool = True,
    ) -> BaseClient:
        """Create a client with the given configuration.
        
        Args:
            name: Unique identifier for the provider
            kind: Type of provider (e.g., 'openai', 'anthropic', 'gemini')
            environment: Provider environment (cloud, local)
            base_url: Base URL for the provider API
            api_key: API key for the provider
            rate_limits: Rate limiting configuration
            use_cache: Whether to cache and reuse client instances (default: True)
            
        Returns:
            BaseClient: The provider client instance
            
        Raises:
            ValueError: If client creation fails
        """
        # Check cache first if enabled
        cache_key = f"{name}:{kind}:{environment}:{base_url}:{api_key}"
        if use_cache and cache_key in self._client_cache:
            logger.debug(f"Using cached client for provider: {name}")
            return self._client_cache[cache_key]

        logger.info(f"Creating new client for provider: {name}")
        logger.info(f"Provider config details:")
        logger.info(f"  - kind: {kind}")
        logger.info(f"  - environment: {environment}")
        logger.info(f"  - base_url: {base_url}")

        try:
            client = get_client(
                name=name,
                kind=kind,
                environment=environment,
                api_key=api_key,
                base_url=base_url,
            )

            # Set rate limits if configured
            if rate_limits:
                logger.debug(
                    f"Setting rate limits for {name} - requests: {rate_limits.get('requests_per_minute')}/min, tokens: {rate_limits.get('tokens_per_minute')}/min"
                )
                client.requests_per_minute = rate_limits.get("requests_per_minute")
                client.tokens_per_minute = rate_limits.get("tokens_per_minute")

            # Cache the client if enabled
            if use_cache:
                self._client_cache[cache_key] = client

            return client

        except Exception as e:
            logger.error(f"Failed to create client for {name}: {str(e)}")
            logger.error(f"Provider config details:")
            logger.error(f"  - kind: {kind}")
            logger.error(f"  - environment: {environment}")
            logger.error(f"  - base_url: {base_url}")
            raise ValueError(f"Failed to create client for {name}: {str(e)}")

    def clear_cache(self) -> None:
        """Clear the client cache"""
        self._client_cache.clear()


# Global provider factory instance
_provider_factory: Optional[ProviderFactory] = None


def get_provider_factory() -> ProviderFactory:
    """Get or create the global provider factory instance.

    Returns:
        ProviderFactory: The global provider factory instance
    """
    global _provider_factory

    if _provider_factory is None:
        _provider_factory = ProviderFactory()
        logger.info("Created new provider factory instance")

    return _provider_factory


def create_provider_client(
    name: str,
    kind: str,
    environment: str,
    base_url: str,
    api_key: str,
    rate_limits: Optional[dict] = None,
    use_cache: bool = True,
) -> BaseClient:
    """Create a provider client with the given configuration.

    Args:
        name: Unique identifier for the provider
        kind: Type of provider (e.g., 'openai', 'anthropic', 'gemini')
        environment: Provider environment (cloud, local)
        base_url: Base URL for the provider API
        api_key: API key for the provider
        rate_limits: Rate limiting configuration
        use_cache: Whether to cache and reuse client instances (default: True)

    Returns:
        BaseClient: The provider client instance

    Raises:
        ValueError: If client creation fails
    """
    factory = get_provider_factory()
    return factory.create_client(
        name=name,
        kind=kind,
        environment=environment,
        base_url=base_url,
        api_key=api_key,
        rate_limits=rate_limits,
        use_cache=use_cache,
    )


def clear_provider_cache() -> None:
    """Clear the provider client cache"""
    if _provider_factory is not None:
        _provider_factory.clear_cache()
