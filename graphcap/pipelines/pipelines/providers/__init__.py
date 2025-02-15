"""
# SPDX-License-Identifier: Apache-2.0
Provider Management System

This module implements a flexible provider management system for handling multiple AI
service providers with an OpenAI-compatible interface.

Key features:
- Unified provider interface
- Multiple provider support (OpenAI, Gemini, etc.)
- Configuration management
- Vision API capabilities
- Structured output handling

Components:
    clients: Provider-specific client implementations
    provider_config: Configuration management
    provider_manager: Provider lifecycle management
    router: FastAPI router for provider endpoints
"""

from .assets import default_provider, provider_list

ASSETS = [provider_list, default_provider]

__all__ = ["ASSETS"]
