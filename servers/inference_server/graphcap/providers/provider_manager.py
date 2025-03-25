"""
# SPDX-License-Identifier: Apache-2.0
Provider Manager Module

This module handles provider lifecycle management and client initialization.

Key features:
- Client initialization
- Environment validation
- Rate limit management

Classes:
    ProviderManager: Main provider management class
"""

from typing import Dict, Optional

from loguru import logger

from .clients import BaseClient, get_client


class ProviderManager:
    """Manager class for handling provider lifecycle and client initialization"""

    def __init__(self, _: Optional[str] = None):
        """Initialize provider manager"""
        logger.info("Initializing ProviderManager")
        self._clients: Dict[str, BaseClient] = {}

    def get_client(
        self,
        name: str,
        kind: str,
        environment: str,
        base_url: str,
        api_key: str,
        default_model: Optional[str] = None,
        rate_limits: Optional[dict] = None,
    ) -> BaseClient:
        """Initialize a client with the given configuration"""
        logger.info(f"Initializing client for provider: {name}")
        logger.info(f"Provider config details:")
        logger.info(f"  - kind: {kind}")
        logger.info(f"  - environment: {environment}")
        logger.info(f"  - base_url: {base_url}")
        logger.info(f"  - default_model: {default_model}")

        try:
            client = get_client(
                name=name,
                kind=kind,
                environment=environment,
                api_key=api_key,
                base_url=base_url,
                default_model=default_model,
            )

            # Set rate limits if configured
            if rate_limits:
                logger.debug(
                    f"Setting rate limits for {name} - requests: {rate_limits.get('requests_per_minute')}/min, tokens: {rate_limits.get('tokens_per_minute')}/min"
                )
                client.requests_per_minute = rate_limits.get("requests_per_minute")
                client.tokens_per_minute = rate_limits.get("tokens_per_minute")

            return client

        except Exception as e:
            logger.error(f"Failed to initialize client for {name}: {str(e)}")
            logger.error(f"Provider config details:")
            logger.error(f"  - kind: {kind}")
            logger.error(f"  - environment: {environment}")
            logger.error(f"  - base_url: {base_url}")
            logger.error(f"  - default_model: {default_model}")
            raise
