"""
# SPDX-License-Identifier: Apache-2.0
Providers Service

Provides services for working with AI providers.
"""

from typing import Any, Dict, List, Protocol, runtime_checkable

from graphcap.providers.clients.base_client import BaseClient
from graphcap.providers.factory import create_provider_client, get_provider_factory
from loguru import logger

from .models import ModelInfo, ProviderConfig


@runtime_checkable
class ModelProvider(Protocol):
    """Protocol for model providers"""
    async def get_available_models(self) -> Any: ...
    async def get_models(self) -> Any: ...


def _extract_model_id(model: Any) -> str:
    """Extract model ID from provider response"""
    if hasattr(model, "id"):
        return model.id
    if hasattr(model, "name"):
        return model.name
    return str(model)


def _create_model_info(model_id: str, default_model: str) -> ModelInfo:
    """Create a ModelInfo instance"""
    return ModelInfo(
        id=model_id,
        name=model_id,
        is_default=model_id == default_model
    )


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
    client = create_provider_client(
        name=provider_name,
        kind=config.kind,
        environment=config.environment,
        base_url=config.base_url,
        api_key=config.api_key,
        default_model=config.default_model,
        rate_limits=config.rate_limits,
        use_cache=True,  # Cache clients for better performance
    )
    
    models = []
    
    # Try to fetch models if configured
    if config.fetch_models and isinstance(client, ModelProvider):
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


def get_provider_manager():
    """
    Get a compatible provider manager using the factory pattern.
    This function creates a wrapper around the provider factory that maintains
    backward compatibility with code expecting a provider manager.
    
    Returns:
        An object with the provider manager interface
    """
    factory = get_provider_factory()
    
    # Create a wrapper object that delegates to the factory
    class ProviderManagerWrapper:
        def __init__(self, factory):
            self.factory = factory
            self._client_cache: Dict[str, BaseClient] = {}
        
        def get_client(self, name: str) -> BaseClient:
            """Get a client for the specified provider"""
            if name in self._client_cache:
                return self._client_cache[name]
                
            # In a real implementation, this would look up the config for the name
            # For now, we're just passing through to create_provider_client
            # which will fail if the provider doesn't exist
            return create_provider_client(name=name, kind="", environment="", base_url="", api_key="")
        
        def available_providers(self) -> List[str]:
            """Return a list of available provider names"""
            # This is a stub - in a real implementation we would return actual providers
            return ["gemini"]
    
    return ProviderManagerWrapper(factory)
