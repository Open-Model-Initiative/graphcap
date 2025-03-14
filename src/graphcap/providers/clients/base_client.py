"""
# SPDX-License-Identifier: Apache-2.0
Base Provider Client

Abstract base class defining the interface for all provider clients.

Key features:
- OpenAI-compatible interface
- Vision API support
- Structured output handling
- Base64 image processing
- Environment variable management

Classes:
    BaseClient: Abstract base class for provider clients
        Attributes:
            name (str): Provider name
            kind (str): Provider type
            environment (str): Deployment environment
            env_var (str): Environment variable for API key
            base_url (str): Base API URL
            default_model (str): Default model identifier
"""

import asyncio
import base64
import os
import time
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from loguru import logger
from openai import AsyncOpenAI
from pydantic import BaseModel


class BaseClient(AsyncOpenAI, ABC):
    """Abstract base class for all provider clients"""

    def __init__(self, name: str, kind: str, environment: str, env_var: str, base_url: str, default_model: str):
        # Check for required environment variable
        if env_var and env_var != "NONE":
            api_key = os.getenv(env_var)
            if api_key is None:
                raise ValueError(f"Environment variable {env_var} is not set")
        else:
            api_key = "stub_key"

        # Initialize OpenAI client
        super().__init__(api_key=api_key, base_url=base_url)

        # Store basic properties needed by router
        self.name = name
        self.kind = kind
        self.environment = environment
        self.env_var = env_var
        self.base_url = base_url
        self.default_model = default_model

        # Rate limiting state
        self._request_times: list[float] = []
        self._token_counts: list[int] = []
        self._rate_limit_lock = asyncio.Lock()
        self.requests_per_minute: int | None = None
        self.tokens_per_minute: int | None = None

    @abstractmethod
    def _format_vision_content(self, text: str, image_data: str) -> list[dict]:
        """Format the vision content according to provider specifications"""
        pass

    def _get_schema_from_input(self, schema: dict | type[BaseModel] | BaseModel) -> dict:
        """Convert input schema to JSON Schema dict"""
        if isinstance(schema, dict):
            return schema
        elif isinstance(schema, type) and issubclass(schema, BaseModel):
            return schema.model_json_schema()
        elif isinstance(schema, BaseModel):
            return schema.__class__.model_json_schema()
        else:
            raise ValueError("Schema must be either a dict or a Pydantic model/instance")

    async def _get_base64_image(self, image_path: str | Path) -> str:
        """Helper method to convert image to base64"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    async def _enforce_rate_limits(self, token_count: int | None = None):
        """Enforce rate limits by waiting if necessary"""
        async with self._rate_limit_lock:
            current_time = time.time()

            minute_ago = current_time - 60

            # Clean up old entries
            self._request_times = [t for t in self._request_times if t > minute_ago]
            self._token_counts = [t for t, time in zip(self._token_counts, self._request_times) if time > minute_ago]

            # Check request rate limit
            if self.requests_per_minute and len(self._request_times) >= self.requests_per_minute:
                wait_time = 60 - (current_time - self._request_times[0])
                if wait_time > 0:
                    logger.warning(f"Rate limit reached, waiting {wait_time:.2f} seconds")
                    await asyncio.sleep(wait_time)

            # Check token rate limit
            if token_count and self.tokens_per_minute:
                current_tokens = sum(self._token_counts)
                if current_tokens + token_count > self.tokens_per_minute:
                    wait_time = 60 - (current_time - self._request_times[0])
                    if wait_time > 0:
                        logger.warning(f"Token limit reached, waiting {wait_time:.2f} seconds")
                        await asyncio.sleep(wait_time)

            # Record this request
            self._request_times.append(current_time)
            if token_count:
                self._token_counts.append(token_count)

    async def vision(
        self,
        prompt: str,
        image: str | Path,
        model: str,
        max_tokens: int = 4096,
        schema: BaseModel | None = None,
        repetition_penalty: float | None = 1.15,
        temperature: float | None = 0.8,
        top_p: float | None = 0.9,
        **kwargs,
    ):
        """Create a vision completion with rate limiting"""
        # Estimate token count - this is approximate
        estimated_tokens = len(prompt.split()) + 1000  # Base tokens + image tokens

        await self._enforce_rate_limits(estimated_tokens)
        # Handle image input
        if isinstance(image, (str, Path)) and not str(image).startswith("data:"):
            image_data = await self._get_base64_image(image)
        else:
            image_data = image.split("base64,")[1] if "base64," in image else image

        # Get provider-specific message format
        content = self._format_vision_content(prompt, image_data)
        try:
            if schema:
                completion = await self.beta.chat.completions.parse(
                    model=model,
                    messages=[{"role": "user", "content": content}],
                    max_tokens=max_tokens,
                    response_format=schema,
                    presence_penalty=repetition_penalty,
                    temperature=temperature,
                    top_p=top_p,
                    timeout=180,
                )
            else:
                completion = await self.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": content}],
                    max_tokens=max_tokens,
                    presence_penalty=repetition_penalty,
                    temperature=temperature,
                    top_p=top_p,
                    timeout=180,
                    **kwargs,
                )
            return completion
        except Exception as e:
            logger.error(f"Vision completion failed: {str(e)}")
            raise

    async def create_structured_completion(
        self, messages: list[dict], schema: dict | type[BaseModel] | BaseModel, model: str, **kwargs
    ) -> Any:
        """Create a structured completion with rate limiting"""
        # Estimate token count from messages
        estimated_tokens = sum(len(str(m.get("content", ""))) // 4 for m in messages)

        await self._enforce_rate_limits(estimated_tokens)
        json_schema = self._get_schema_from_input(schema)

        try:
            completion = await self.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_schema", "schema": json_schema},
                **kwargs,
            )

            if isinstance(schema, type) and issubclass(schema, BaseModel):
                return schema.model_validate_json(completion.choices[0].message.content)
            elif isinstance(schema, BaseModel):
                return schema.__class__.model_validate_json(completion.choices[0].message.content)
            return completion

        except Exception as e:
            logger.error(f"Failed to create structured completion: {str(e)}")
            raise
