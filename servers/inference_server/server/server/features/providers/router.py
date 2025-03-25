"""
# SPDX-License-Identifier: Apache-2.0
Providers Router

Defines API routes for working with AI providers.

This module provides the following endpoints:
- POST /providers/{provider_name}/models - List available models for a provider using provided configuration
"""

from fastapi import APIRouter, HTTPException

from .models import ProviderConfig, ProviderModelsResponse
from .service import get_provider_models

router = APIRouter(prefix="/providers", tags=["providers"])


@router.post("/{provider_name}/models", response_model=ProviderModelsResponse)
async def list_provider_models(provider_name: str, config: ProviderConfig) -> ProviderModelsResponse:
    """
    List available models for a specific provider using provided configuration.

    Args:
        provider_name: Name of the provider to get models for
        config: Provider configuration for this request

    Returns:
        List of available models for the provider

    Raises:
        HTTPException: If there is an error getting models
    """
    try:
        models = await get_provider_models(provider_name, config)
        return ProviderModelsResponse(provider=provider_name, models=models)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting models: {str(e)}")
