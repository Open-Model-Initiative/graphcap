"""
# SPDX-License-Identifier: Apache-2.0
Providers API Models

Defines data models for the providers API endpoints.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class ProviderInfo(BaseModel):
    """Information about a provider."""

    name: str = Field(..., description="Unique identifier for the provider")
    kind: str = Field(..., description="Type of provider (e.g., 'openai', 'anthropic', 'gemini')")


class ProviderListResponse(BaseModel):
    """Response model for listing available providers."""

    providers: List[ProviderInfo] = Field(..., description="List of available providers")


class ModelInfo(BaseModel):
    """Information about a model."""

    id: str = Field(..., description="Unique identifier for the model")
    name: str = Field(..., description="Display name of the model")
    is_default: bool = Field(False, description="Whether this is the default model for the provider")


class ProviderModelsResponse(BaseModel):
    """Response model for listing available models for a provider."""

    provider: str = Field(..., description="Name of the provider")
    models: List[ModelInfo] = Field(..., description="List of available models")


class ProviderConfig(BaseModel):
    """Provider configuration model."""
    
    name: str = Field(..., description="Unique identifier for the provider")
    kind: str = Field(..., description="Type of provider (e.g., 'openai', 'anthropic', 'gemini')")
    environment: str = Field(..., description="Provider environment (cloud, local)")
    base_url: str = Field(..., description="Base URL for the provider API")
    api_key: str = Field(..., description="API key for the provider")
    models: List[str] = Field(default_factory=list, description="List of available model IDs")
    fetch_models: bool = Field(default=True, description="Whether to fetch models from the provider API")
    rate_limits: Optional[dict] = Field(None, description="Rate limiting configuration")


class ProviderConfigureRequest(BaseModel):
    """Request model for configuring a provider."""
    
    config: ProviderConfig = Field(..., description="Provider configuration")
