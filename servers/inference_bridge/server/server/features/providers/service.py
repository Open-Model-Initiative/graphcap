"""
# SPDX-License-Identifier: Apache-2.0
Providers Service

Provides services for working with AI providers.
"""

from typing import Any, Dict, List, Protocol, runtime_checkable
import datetime

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


def _create_model_info(model_id: str) -> ModelInfo:
    """Create a ModelInfo instance"""
    return ModelInfo(
        id=model_id,
        name=model_id,
        is_default=False
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
        rate_limits=config.rate_limits,
        use_cache=True,  # Cache clients for better performance
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
                        models.append(_create_model_info(model_id))
            elif hasattr(client, "get_models"):
                provider_models = await client.get_models()
                if hasattr(provider_models, "models"):
                    for model in provider_models.models:
                        model_id = _extract_model_id(model)
                        models.append(_create_model_info(model_id))
        except Exception as e:
            logger.error(f"Error fetching models from provider {provider_name}: {str(e)}")
            logger.info(f"Falling back to configured models for provider {provider_name}")

    # Fall back to configured models if none fetched
    if not models:
        models = [_create_model_info(model_id) for model_id in config.models]
        logger.info(f"Using {len(models)} configured models for provider {provider_name}")

    return models


def create_provider_client_from_config(config: ProviderConfig) -> BaseClient:
    """
    Create a provider client from a configuration.
    
    Args:
        config: Provider configuration
        
    Returns:
        Provider client
        
    Raises:
        ValueError: If client creation fails
    """
    logger.info(f"Creating provider client from config for {config.name}")
    return create_provider_client(
        name=config.name,
        kind=config.kind,
        environment=config.environment,
        base_url=config.base_url,
        api_key=config.api_key,
        rate_limits=config.rate_limits,
        use_cache=True,
    )


async def test_provider_connection(provider_name: str, config: ProviderConfig) -> Dict[str, Any]:
    """
    Test connection to a provider by initializing the client and performing a simple operation.

    Args:
        provider_name: Name of the provider to test
        config: Provider configuration for this request

    Returns:
        Dictionary containing test results and additional information

    Raises:
        Exception: If the connection test fails
    """
    result = {
        "provider": provider_name,
        "details": {},
        "diagnostics": {
            "config_summary": {
                "kind": config.kind,
                "environment": config.environment,
                "base_url_valid": bool(config.base_url),
                "api_key_provided": bool(config.api_key),
                "models_count": len(config.models),
            },
            "connection_steps": [],
            "warnings": []
        }
    }
    
    try:
        # Add diagnostic step
        result["diagnostics"]["connection_steps"].append({
            "step": "initialize_client",
            "status": "pending",
            "timestamp": str(datetime.datetime.now())
        })
        
        # Initialize client with provided configuration
        client = create_provider_client(
            name=provider_name,
            kind=config.kind,
            environment=config.environment,
            base_url=config.base_url,
            api_key=config.api_key,
            rate_limits=config.rate_limits,
            use_cache=False,  # Don't cache test clients
        )
        
        # Update diagnostic step
        result["diagnostics"]["connection_steps"][-1]["status"] = "success"
        result["client_initialized"] = True
        
        # Check if an empty API key was provided
        if not config.api_key:
            result["diagnostics"]["warnings"].append({
                "warning_type": "empty_api_key",
                "message": "An empty API key was provided. This might not work with most providers."
            })
        
        # Check if the base URL seems valid
        if not config.base_url.startswith(("http://", "https://")):
            result["diagnostics"]["warnings"].append({
                "warning_type": "invalid_base_url",
                "message": "The base URL doesn't start with http:// or https://"
            })
        
        # Try to test the connection with a lightweight operation
        # First check if we can get models (most providers support this)
        try:
            # Add diagnostic step for model list
            result["diagnostics"]["connection_steps"].append({
                "step": "list_models",
                "status": "pending",
                "timestamp": str(datetime.datetime.now())
            })
            
            if hasattr(client, "get_available_models"):
                provider_models = await client.get_available_models()
                result["details"]["method"] = "get_available_models"
                
                # Add model information if available
                if hasattr(provider_models, "data"):
                    models_data = []
                    for model in provider_models.data:
                        model_id = _extract_model_id(model)
                        models_data.append({"id": model_id})
                    result["details"]["available_models"] = models_data
                    result["details"]["models_count"] = len(models_data)
                    
            elif hasattr(client, "get_models"):
                provider_models = await client.get_models()
                result["details"]["method"] = "get_models"
                
                # Add model information if available
                if hasattr(provider_models, "models"):
                    models_data = []
                    for model in provider_models.models:
                        model_id = _extract_model_id(model)
                        models_data.append({"id": model_id})
                    result["details"]["available_models"] = models_data
                    result["details"]["models_count"] = len(models_data)
            
            # Update diagnostic step
            result["diagnostics"]["connection_steps"][-1]["status"] = "success"
            
        except Exception as e:
            logger.warning(f"Could not list models for {provider_name}: {str(e)}")
            result["diagnostics"]["connection_steps"][-1]["status"] = "skipped"
            result["diagnostics"]["connection_steps"][-1]["message"] = "Model listing not supported or failed"
            
        # Connection test successful
        result["connected"] = True
        result["success"] = True
        result["message"] = f"Successfully connected to {provider_name}"
        
        return result
    except Exception as e:
        logger.error(f"Error testing connection to {provider_name}: {str(e)}")
        
        # Update the last diagnostic step if it's pending
        if result["diagnostics"]["connection_steps"] and result["diagnostics"]["connection_steps"][-1]["status"] == "pending":
            result["diagnostics"]["connection_steps"][-1]["status"] = "failed"
            result["diagnostics"]["connection_steps"][-1]["error"] = str(e)
        
        # Add overall failure information
        result["connected"] = False
        result["success"] = False
        result["message"] = f"Failed to connect to {provider_name}: {str(e)}"
        result["error"] = str(e)
        
        return result
