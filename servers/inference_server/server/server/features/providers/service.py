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
                "default_model": config.default_model,
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
            default_model=config.default_model,
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
        if isinstance(client, ModelProvider):
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
        
        # Try a simple chat completion as a more thorough test
        try:
            # Add diagnostic step for chat completion
            result["diagnostics"]["connection_steps"].append({
                "step": "test_chat_completion",
                "status": "pending",
                "timestamp": str(datetime.datetime.now())
            })
            
            # Use the first available model or default model
            test_model = None
            if result.get("details", {}).get("available_models"):
                test_model = result["details"]["available_models"][0]["id"]
            elif config.default_model:
                test_model = config.default_model
            
            if test_model:
                # Simple test message
                test_messages = [{"role": "user", "content": "Hello, this is a test message. Please respond with 'OK' if you can process this request."}]
                
                completion = await client.chat.completions.create(
                    model=test_model,
                    messages=test_messages,
                    max_tokens=10,  # Keep it minimal
                    temperature=0,  # Deterministic
                )
                
                result["connection_verified"] = True
                result["details"]["chat_completion_test"] = "success"
                result["details"]["test_model"] = test_model
                result["diagnostics"]["connection_steps"][-1]["status"] = "success"
            else:
                result["diagnostics"]["connection_steps"][-1]["status"] = "skipped"
                result["diagnostics"]["connection_steps"][-1]["message"] = "No suitable model found for testing"
                
        except Exception as e:
            logger.error(f"Chat completion test failed for {provider_name}: {str(e)}")
            result["diagnostics"]["connection_steps"][-1]["status"] = "failed"
            result["diagnostics"]["connection_steps"][-1]["error"] = str(e)
            result["diagnostics"]["connection_steps"][-1]["error_type"] = type(e).__name__
            
            # Only mark connection as failed if we couldn't list models either
            if not result.get("details", {}).get("available_models"):
                result["connection_verified"] = False
                result["details"]["error"] = str(e)
                result["details"]["error_type"] = type(e).__name__
                
                # Add specific suggestions based on error type
                if "authentication" in str(e).lower() or "unauthorized" in str(e).lower() or "auth" in str(e).lower():
                    result["details"]["suggestion"] = "Check if the API key is valid and has necessary permissions"
                elif "timeout" in str(e).lower():
                    result["details"]["suggestion"] = "Connection timed out. Check network connectivity or server status"
                elif "url" in str(e).lower() or "endpoint" in str(e).lower():
                    result["details"]["suggestion"] = "Check if the base URL is correct for this provider"
                
                raise Exception(f"Error verifying connection: {str(e)}")
            else:
                # If we could list models but chat completion failed, just warn
                result["diagnostics"]["warnings"].append({
                    "warning_type": "chat_completion_failed",
                    "message": f"Chat completion test failed but model listing succeeded. Provider may have limited functionality. Error: {str(e)}"
                })
                result["connection_verified"] = True
                result["details"]["method"] = "list_models_only"
        
        return result
        
    except Exception as e:
        logger.error(f"Error initializing provider client for {provider_name}: {str(e)}")
        
        # Update diagnostic information
        if "connection_steps" in result["diagnostics"] and result["diagnostics"]["connection_steps"]:
            result["diagnostics"]["connection_steps"][-1]["status"] = "failed"
            result["diagnostics"]["connection_steps"][-1]["error"] = str(e)
            result["diagnostics"]["connection_steps"][-1]["error_type"] = type(e).__name__
        
        result["client_initialized"] = False
        result["connection_verified"] = False
        result["details"]["error"] = str(e)
        result["details"]["error_type"] = type(e).__name__
        
        # Add specific suggestions based on error type
        if any(keyword in str(e).lower() for keyword in ["api key", "authentication", "auth", "credential"]):
            result["details"]["suggestion"] = "Check if the API key is valid"
        elif any(keyword in str(e).lower() for keyword in ["url", "endpoint", "address"]):
            result["details"]["suggestion"] = "Check if the base URL is correct"
        elif any(keyword in str(e).lower() for keyword in ["timeout", "connect"]):
            result["details"]["suggestion"] = "Network connectivity issue. Check your internet connection"
        elif "provider" in str(e).lower():
            result["details"]["suggestion"] = "Verify that the provider type is supported and correctly configured"
        
        raise Exception(f"Failed to initialize provider client: {str(e)}", result)
