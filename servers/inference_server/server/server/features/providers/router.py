"""
# SPDX-License-Identifier: Apache-2.0
Providers Router

Defines API routes for working with AI providers.

This module provides the following endpoints:
- GET /providers/list - List all available providers
- GET /providers/check/{provider_name} - Check if a specific provider is available
- GET /providers/{provider_name}/models - List available models for a specific provider
"""

from fastapi import APIRouter, HTTPException

from .models import ProviderListResponse, ProviderModelsResponse
from .service import get_available_providers, get_provider_manager, get_provider_models

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/list", response_model=ProviderListResponse)
async def list_providers() -> ProviderListResponse:
    """
    List all available providers.

    Returns:
        List of available providers
    """
    providers = get_available_providers()
    return ProviderListResponse(providers=providers)


@router.get("/check/{provider_name}")
async def check_provider(provider_name: str) -> dict:
    """
    Check if a specific provider is available.

    Args:
        provider_name: Name of the provider to check

    Returns:
        Status of the provider

    Raises:
        HTTPException: If the provider is not found
    """
    provider_manager = get_provider_manager()
    available_providers = provider_manager.available_providers()

    if provider_name not in available_providers:
        raise HTTPException(
            status_code=404,
            detail=f"Provider '{provider_name}' not found. Available providers: {', '.join(available_providers)}",
        )

    # Get the provider config
    provider_config = provider_manager.get_provider_config(provider_name)

    return {
        "status": "available",
        "provider": provider_name,
        "kind": provider_config.kind,
        "environment": provider_config.environment,
        "default_model": provider_config.default_model or "",
    }


@router.get("/{provider_name}/models", response_model=ProviderModelsResponse)
async def list_provider_models(provider_name: str) -> ProviderModelsResponse:
    """
    List available models for a specific provider.

    Args:
        provider_name: Name of the provider to get models for

    Returns:
        List of available models for the provider

    Raises:
        HTTPException: If the provider is not found
    """
    try:
        models = await get_provider_models(provider_name)
        return ProviderModelsResponse(provider=provider_name, models=models)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting models: {str(e)}")
