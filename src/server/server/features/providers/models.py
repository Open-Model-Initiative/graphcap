"""
# SPDX-License-Identifier: Apache-2.0
Providers API Models

Defines data models for the providers API endpoints.
"""

from typing import List

from pydantic import BaseModel, Field


class ProviderInfo(BaseModel):
    """Information about a provider."""

    name: str = Field(..., description="Unique identifier for the provider")
    kind: str = Field(..., description="Type of provider (e.g., 'openai', 'anthropic', 'gemini')")
    default_model: str = Field("", description="Default model used by the provider")


class ProviderListResponse(BaseModel):
    """Response model for listing available providers."""

    providers: List[ProviderInfo] = Field(..., description="List of available providers") 