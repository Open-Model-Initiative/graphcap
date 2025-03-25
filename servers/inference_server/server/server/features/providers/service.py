"""
# SPDX-License-Identifier: Apache-2.0
Providers Service

Provides services for working with AI providers.
"""

from typing import Any, List

from graphcap.providers.factory import initialize_provider_manager
from graphcap.providers.provider_manager import ProviderManager
from loguru import logger

from .models import ModelInfo, ProviderConfig

# Global provider manager instance for handling requests
_provider_manager: ProviderManager = initialize_provider_manager(None)


async def get_provider_models(provider_name: str, config: ProviderConfig) -> List[ModelInfo]:
    """
    Get a list of available models for a specific provider.

    Args:
        provider_name: Name of the provider to get models for
        config: Provider configuration for this request
    Returns:
        List of model information
    """
    # Initialize client with provided configuration
    client = _provider_manager.get_client(
        name=provider_name,
        kind=config.kind,
        environment=config.environment,
        base_url=config.base_url,
        api_key=config.api_key,
        default_model=config.default_model,
        rate_limits=config.rate_limits
    )
    
    models = []
    
    # Try to fetch models if configured
    if config.fetch_models:
        try:
            logger.info(f"Fetching models from provider {provider_name}")
            if hasattr(client, "get_available_models"):
                provider_models = await client.get_available_models()
                if hasattr(provider_models, "data"):
                    for model in provider_models.data:
                        model_id = _extract_model_id(model)
                        models.append(_create_model_info(model_id, config.default_model or ""))
            elif hasattr(client, "get_models"):
                provider_models = await client.get_models()
                if hasattr(provider_models, "models"):
                    for model in provider_models.models:
                        model_id = _extract_model_id(model)
                        models.append(_create_model_info(model_id, config.default_model or ""))
        except Exception as e:
            logger.error(f"Error fetching models from provider {provider_name}: {str(e)}")
            logger.info(f"Falling back to configured models for provider {provider_name}")

    # Fall back to configured models if none fetched
    if not models:
        models = [_create_model_info(model_id, config.default_model or "") for model_id in config.models]
        logger.info(f"Using {len(models)} configured models for provider {provider_name}")

    return models


def _create_model_info(model_id: str, default_model: str) -> ModelInfo:
    """Create a ModelInfo instance with the given ID and default model."""
    return ModelInfo(id=model_id, name=model_id, is_default=(model_id == default_model))


def _extract_model_id(model: Any) -> str:
    """Extract model ID from a model object."""
    if hasattr(model, "id"):
        return model.id
    return model.name if hasattr(model, "name") else str(model)
