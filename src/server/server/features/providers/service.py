"""
# SPDX-License-Identifier: Apache-2.0
Providers Service

Provides services for working with AI providers.
"""

import os
from pathlib import Path
from typing import List, Optional

from graphcap.providers.factory import initialize_provider_manager
from graphcap.providers.provider_manager import ProviderManager
from loguru import logger

from ...config import settings
from .models import ProviderInfo

# Global provider manager instance
_provider_manager: Optional[ProviderManager] = None


def get_provider_manager() -> ProviderManager:
    """
    Get or initialize the provider manager.
    
    Returns:
        ProviderManager: The initialized provider manager
    """
    global _provider_manager

    if _provider_manager is None:
        # Use the provider config path from server settings
        config_path = settings.PROVIDER_CONFIG_PATH

        # Verify the config path exists
        if config_path is None:
            logger.warning("Provider config path is None, using default locations")
        elif not os.path.exists(str(config_path)):
            logger.warning(f"Provider config path does not exist: {config_path}")
            # Check if the directory exists
            config_dir = Path(str(config_path)).parent
            if not os.path.exists(str(config_dir)):
                logger.warning(f"Config directory does not exist: {config_dir}")
            else:
                logger.info(f"Config directory exists: {config_dir}, but provider.config.toml is missing")
                # List files in the directory
                files = os.listdir(str(config_dir))
                logger.info(f"Files in config directory: {files}")
        else:
            logger.info(f"Provider config file exists: {config_path}")

        logger.info(f"Initializing provider manager with config path: {config_path}")
        _provider_manager = initialize_provider_manager(config_path)

        # Log the available providers
        provider_names = _provider_manager.available_providers()
        if provider_names:
            logger.info(f"Available providers: {', '.join(provider_names)}")
        else:
            logger.warning("No providers available. Check your provider.config.toml file.")

    return _provider_manager


def get_available_providers() -> List[ProviderInfo]:
    """
    Get a list of available providers.
    
    Returns:
        List of provider information
    """
    # Get the provider manager
    provider_manager = get_provider_manager()

    # Get the list of available providers
    provider_names = provider_manager.available_providers()
    providers = []

    for name in provider_names:
        try:
            config = provider_manager.get_provider_config(name)
            providers.append(
                ProviderInfo(
                    name=name,
                    kind=config.kind,
                    default_model=config.default_model or "",
                )
            )
        except Exception as e:
            logger.error(f"Error getting provider {name}: {str(e)}")

    return providers
