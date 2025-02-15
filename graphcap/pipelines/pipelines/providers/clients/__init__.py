"""
# SPDX-License-Identifier: Apache-2.0
Provider Client Collection

Collection of OpenAI-compatible clients for different AI service providers.

Key features:
- Unified OpenAI-compatible interface
- Multiple provider support
- Vision capabilities
- Structured output handling

Clients:
    BaseClient: Abstract base class for all clients
    OpenAIClient: Standard OpenAI API client
    GeminiClient: Google's Gemini API client
    OllamaClient: Local Ollama API client
    VLLMClient: Local VLLM API client
    OpenRouterClient: OpenRouter API client
"""

from .base_client import BaseClient
from .gemini_client import GeminiClient
from .ollama_client import OllamaClient
from .openai_client import OpenAIClient
from .openrouter_client import OpenRouterClient
from .vllm_client import VLLMClient

__all__ = [
    "BaseClient",
    "GeminiClient",
    "OllamaClient",
    "OpenAIClient",
    "OpenRouterClient",
    "VLLMClient",
]
