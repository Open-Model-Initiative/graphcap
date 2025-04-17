"""
# SPDX-License-Identifier: Apache-2.0
Ollama Provider Client

OpenAI-compatible client implementation for local Ollama deployments.

Key features:
- Local model deployment support
- Model listing and management
- Health check endpoint
- Vision capabilities
- OpenAI compatibility layer

Classes:
    OllamaClient: Ollama API client implementation
"""

from typing import Any

import httpx
from loguru import logger

from .base_client import BaseClient


class OllamaClient(BaseClient):
    """Client for Ollama API with OpenAI compatibility layer"""

    def __init__(self, name: str, kind: str, environment: str, base_url: str, api_key: str = "stub_key"):
        logger.info("Initializing OllamaClient:")
        logger.info(f"  - name: {name}")
        logger.info(f"  - kind: {kind}")
        logger.info(f"  - environment: {environment}")
        logger.info(f"  - base_url: {base_url}")

        # Store the raw base URL for Ollama-specific endpoints
        base_url = base_url.rstrip("/")

        # For OpenAI compatibility, we need /v1 in the URL
        # But we need to handle cases where it's already there
        if "/v1" in base_url:
            # If /v1 is in the middle of the URL, split at that point
            parts = base_url.split("/v1", 1)
            self._raw_base_url = parts[0]
            openai_base_url = base_url
            logger.debug("Using existing /v1 path for OpenAI compatibility")
        else:
            # If no /v1, use the base URL as raw and append /v1 for OpenAI
            self._raw_base_url = base_url
            openai_base_url = f"{base_url}/v1"
            logger.debug("Adding /v1 to base URL for OpenAI compatibility")

        # Initialize with OpenAI-compatible base URL
        super().__init__(
            name=name,
            kind=kind,
            environment=environment,
            base_url=openai_base_url,
            api_key=api_key,
        )
        logger.debug(f"OllamaClient initialized with environment: {environment}, kind: {kind}")
        logger.debug(f"Using base URL {self._raw_base_url} for Ollama endpoints")
        logger.debug(f"Using base URL {self.base_url} for OpenAI-compatible endpoints")

    def _format_vision_content(self, text: str, image_data: str) -> list[dict[str, Any]]:
        """Format vision content for Ollama API"""
        logger.debug("Formatting vision content for Ollama API")
        return [
            {"type": "text", "text": text},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
        ]

    async def get_models(self):
        """Get list of available models from Ollama."""
        try:
            logger.info("Fetching models from Ollama:")
            logger.info(f"  - URL: {self._raw_base_url}/models")

            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self._raw_base_url}/models")
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully retrieved {len(data.get('models', []))} models from Ollama")
                logger.debug(f"Available models: {[m.get('name') for m in data.get('models', [])]}")
                return data
        except httpx.ConnectError as e:
            logger.error("Connection error while fetching models from Ollama:")
            logger.error(f"  - Error: {str(e)}")
            logger.error(f"  - URL: {self._raw_base_url}/models")
            raise
        except Exception as e:
            logger.error(f"Failed to get models from Ollama: {str(e)}")
            raise

    async def health(self):
        """Check the health of the Ollama API"""
        try:
            logger.info("Checking Ollama health:")
            logger.info(f"  - URL: {self._raw_base_url}")

            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self._raw_base_url}")
                response.raise_for_status()
                logger.info("Ollama health check successful")
                return response.json()
        except httpx.ConnectError as e:
            logger.error("Connection error during Ollama health check:")
            logger.error(f"  - Error: {str(e)}")
            logger.error(f"  - URL: {self._raw_base_url}")
            raise
        except Exception as e:
            logger.error(f"Ollama health check failed: {str(e)}")
            raise
