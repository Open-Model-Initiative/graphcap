"""
# SPDX-License-Identifier: Apache-2.0
Provider Factory Module

This module provides factory functions for creating provider clients.
"""

import os
import tempfile
from pathlib import Path
from typing import Optional

from loguru import logger

from .clients import BaseClient, get_client
from .provider_config import get_providers_config
from .provider_manager import ProviderManager

# Global provider manager instance
_provider_manager: Optional[ProviderManager] = None


def initialize_provider_manager(config_path: Optional[str | Path] = None) -> ProviderManager:
    """Initialize the global provider manager with the given config path.
    
    Args:
        config_path: Path to the provider configuration file. If None, uses default locations.
        
    Returns:
        ProviderManager: The initialized provider manager
    """
    global _provider_manager
    
    if config_path is None:
        # Try to find config in standard locations
        possible_paths = [
            os.environ.get("PROVIDER_CONFIG_PATH"),
            "./provider.config.toml",
            "./config/provider.config.toml",
            "/app/provider.config.toml",
            "/app/config/provider.config.toml",
        ]
        
        for path in possible_paths:
            if path and Path(path).exists():
                config_path = path
                break
    
    if not config_path or not Path(str(config_path)).exists():
        logger.warning(f"No provider config found at {config_path}. Using empty configuration.")
        # Create a temporary empty config file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".toml") as temp:
            temp.write(b"# Empty provider config\n")
            config_path = temp.name
    
    # At this point, config_path should not be None
    _provider_manager = ProviderManager(str(config_path))
    return _provider_manager


def get_provider_client(provider_name: str = "default") -> BaseClient:
    """Get a provider client by name.
    
    Args:
        provider_name: Name of the provider to get. Defaults to "default".
        
    Returns:
        BaseClient: The provider client
        
    Raises:
        ValueError: If the provider is not found
    """
    global _provider_manager
    
    if _provider_manager is None:
        initialize_provider_manager()
        
    if _provider_manager is None:
        raise ValueError("Failed to initialize provider manager")
    
    try:
        return _provider_manager.get_client(provider_name)
    except ValueError as e:
        logger.error(f"Failed to get provider client: {e}")
        raise 