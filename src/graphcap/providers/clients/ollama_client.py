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

    def __init__(self, name: str, kind: str, environment: str, env_var: str, base_url: str, default_model: str):
        logger.info(f"Initializing OllamaClient with base_url: {base_url}, model: {default_model}")
        super().__init__(
            name=name,
            kind=kind,
            environment=environment,
            env_var=env_var,
            base_url=base_url.rstrip("/"),
            default_model=default_model,
        )
        logger.debug(f"OllamaClient initialized with environment: {environment}, kind: {kind}")

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
            logger.debug(f"Fetching models from Ollama at {self.base_url}/api/tags")
            response = await self.get("models")
            logger.info(f"Successfully retrieved {len(response.get('models', []))} models from Ollama")
            return response
        except httpx.ConnectError as e:
            logger.error(f"Connection error while fetching models from Ollama: {str(e)}")
            logger.debug(f"Connection details - Host: {self.base_url}, Timeout: {self.timeout}")
            raise
        except Exception as e:
            logger.error(f"Failed to get models from Ollama: {str(e)}")
            raise

    async def health(self):
        """Check the health of the Ollama API"""
        try:
            logger.debug(f"Checking Ollama health at {self.base_url}/health")
            status = httpx.get(f"{self.base_url}/health")
            status.raise_for_status()
            logger.info("Ollama health check successful")
            return status.json()
        except httpx.ConnectError as e:
            logger.error(f"Connection error during Ollama health check: {str(e)}")
            logger.debug(f"Connection details - Host: {self.base_url}")
            raise
        except Exception as e:
            logger.error(f"Ollama health check failed: {str(e)}")
            raise
