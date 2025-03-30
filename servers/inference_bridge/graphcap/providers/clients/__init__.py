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

from loguru import logger

from .base_client import BaseClient
from .gemini_client import GeminiClient
from .ollama_client import OllamaClient
from .openai_client import OpenAIClient
from .openrouter_client import OpenRouterClient
from .vllm_client import VLLMClient


def get_client(kind: str, **kwargs) -> BaseClient:
    client: BaseClient
    logger.info(f"Creating client for {kind} with args: {kwargs}")
    if kind == "openai":
        client = OpenAIClient(kind=kind, **kwargs)
    elif kind == "gemini":
        client = GeminiClient(kind=kind, **kwargs)
    elif kind == "vllm":
        client = VLLMClient(kind=kind, **kwargs)
    elif kind == "ollama":
        client = OllamaClient(kind=kind, **kwargs)
    elif kind == "openrouter":
        client = OpenRouterClient(kind=kind, **kwargs)
    else:
        raise ValueError(f"Unknown provider kind: {kind}")
    return client


__all__ = [
    "BaseClient",
    "GeminiClient",
    "OllamaClient",
    "OpenAIClient",
    "OpenRouterClient",
    "VLLMClient",
    "get_client",
]
