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
from .models import ModelInfo, ProviderInfo

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


async def get_provider_models(provider_name: str) -> List[ModelInfo]:
    """
    Get a list of available models for a specific provider.
    
    Args:
        provider_name: Name of the provider to get models for
        
    Returns:
        List of model information
        
    Raises:
        ValueError: If the provider is not found
    """
    # Get the provider manager
    provider_manager = get_provider_manager()
    
    # Check if the provider exists
    available_providers = provider_manager.available_providers()
    if provider_name not in available_providers:
        raise ValueError(f"Provider '{provider_name}' not found. Available providers: {', '.join(available_providers)}")
    
    # Get the provider config
    config = provider_manager.get_provider_config(provider_name)
    
    # Get the client
    client = provider_manager.get_client(provider_name)
    
    models = []
    
    # Try to fetch models from the provider if fetch_models is True
    if config.fetch_models:
        try:
            logger.info(f"Fetching models from provider {provider_name}")
            
            # Different clients might have different methods to get models
            if hasattr(client, "get_available_models"):
                provider_models = await client.get_available_models()
                # Extract model IDs from the response (format may vary by provider)
                if hasattr(provider_models, "data"):
                    for model in provider_models.data:
                        model_id = model.id
                        models.append(
                            ModelInfo(
                                id=model_id,
                                name=model_id,
                                is_default=(model_id == config.default_model)
                            )
                        )
            elif hasattr(client, "get_models"):
                provider_models = await client.get_models()
                # Extract model IDs from the response (format may vary by provider)
                if hasattr(provider_models, "models"):
                    for model in provider_models.models:
                        model_id = model.id if hasattr(model, "id") else model.name
                        models.append(
                            ModelInfo(
                                id=model_id,
                                name=model_id,
                                is_default=(model_id == config.default_model)
                            )
                        )
            
            logger.info(f"Found {len(models)} models for provider {provider_name}")
        except Exception as e:
            logger.error(f"Error fetching models from provider {provider_name}: {str(e)}")
            # Fall back to configured models
            logger.info(f"Falling back to configured models for provider {provider_name}")
    
    # If no models were fetched or fetch_models is False, use the configured models
    if not models:
        for model_id in config.models:
            models.append(
                ModelInfo(
                    id=model_id,
                    name=model_id,
                    is_default=(model_id == config.default_model)
                )
            )
        
        logger.info(f"Using {len(models)} configured models for provider {provider_name}")
    
    return models
