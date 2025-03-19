#!/usr/bin/env python3
"""
# SPDX-License-Identifier: Apache-2.0
REST API Test for Graphcap

This script tests the REST API endpoint for generating captions using httpx.
"""

import asyncio
import json
import platform
import sys
from typing import List, Optional

import httpx
from loguru import logger
from pydantic import BaseModel

# Configure debug logging
logger.remove()  # Remove default handler
logger.add(
    sys.stderr,
    level="DEBUG",
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
)

# Constants
API_BASE_URL = "http://localhost:32100/api/v1"
# Use host.docker.internal when running in Docker, localhost otherwise
OLLAMA_HOST = "host.docker.internal" if platform.system() == "Linux" else "localhost"
OLLAMA_BASE_URL = f"http://{OLLAMA_HOST}:11434"
IMAGE_PATH = "/workspace/datasets/os_img/big-buddha-5587706_1280.jpg"

logger.debug(f"Using Ollama host: {OLLAMA_HOST}")
logger.debug(f"Full Ollama URL: {OLLAMA_BASE_URL}")


class CaptionRequest(BaseModel):
    """Request model for caption generation."""

    perspective: str
    image_path: str
    provider: str
    max_tokens: int = 4096
    temperature: float = 0.8
    top_p: float = 0.9
    repetition_penalty: float = 1.15
    context: Optional[List[str]] = ["string"]
    global_context: str = "You are a structured captioning model."


class StructuredCaption(BaseModel):
    """Response model for structured caption."""

    scratchpad: str
    caption: str


async def check_ollama_health():
    """Check if Ollama is running and healthy."""
    try:
        async with httpx.AsyncClient() as client:
            logger.debug("Creating httpx client for health check")
            url = f"{OLLAMA_BASE_URL}"
            logger.debug(f"Sending GET request to {url}")

            response = await client.get(url)
            logger.debug(f"Response status: {response.status_code}")
            logger.debug(f"Response headers: {response.headers}")
            logger.debug(f"Response text: {response.text}")

            response.raise_for_status()
            if "Ollama is running" in response.text:
                logger.info("Ollama health check successful")
                return True
            else:
                logger.error(f"Unexpected Ollama response: {response.text}")
                return False
    except httpx.ConnectError as e:
        logger.error(f"Connection error during health check: {str(e)}")
        logger.debug(f"Connection details: {e.__cause__}")
        return False
    except Exception as e:
        logger.error(f"Ollama health check failed: {str(e)}")
        logger.debug(f"Exception details: {e.__cause__ if hasattr(e, '__cause__') else 'No cause info'}")
        return False


async def test_caption_generation(provider: str):
    """Test the caption generation REST API endpoint.

    Args:
        provider: The provider to use for caption generation (e.g., 'ollama' or 'gemini')
    """
    logger.info(f"\n{'=' * 50}\nTesting with {provider.upper()} provider\n{'=' * 50}")

    # For Ollama provider, check health first
    if provider == "ollama":
        logger.debug("Starting Ollama health check")
        is_healthy = await check_ollama_health()
        if not is_healthy:
            logger.error("Skipping Ollama test due to health check failure")
            return
        logger.debug("Ollama health check passed")

    # Prepare the request
    request = CaptionRequest(
        perspective="graph_caption",
        image_path=IMAGE_PATH,
        provider=provider,
        max_tokens=4096,
        temperature=0.8,
        top_p=0.9,
        repetition_penalty=1.15,
        context=["string"],
        global_context="You are a structured captioning model.",
    )

    endpoint = f"{API_BASE_URL}/perspectives/caption-from-path"

    try:
        logger.debug("Creating httpx client with 30s timeout")
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.debug(f"Sending POST request to {endpoint}")
            logger.debug("Request headers: accept=application/json, Content-Type=application/json")
            logger.info(f"Request payload: {request.model_dump_json(indent=2)}")

            response = await client.post(
                endpoint,
                json=request.model_dump(),
                headers={"accept": "application/json", "Content-Type": "application/json"},
            )

            # Log response details
            logger.debug(f"Response status: {response.status_code}")
            logger.debug(f"Response headers: {response.headers}")

            # Check response status
            response.raise_for_status()

            # Parse response
            data = response.json()
            logger.info("Response received:")
            logger.info(json.dumps(data, indent=2))

            # Access the structured result
            if "result" in data:
                structured_result = data["result"]
                logger.info("\nStructured Result:")
                logger.info(json.dumps(structured_result, indent=2))

                # If there's an error in the result, log it at debug level
                if isinstance(structured_result, dict) and "error" in structured_result:
                    logger.debug(f"Error details in result: {structured_result['error']}")
            else:
                logger.warning("No structured result found in response")

            if "raw_text" in data:
                logger.info("\nRaw Text:")
                logger.info(data["raw_text"])

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e.response.text}")
        logger.debug(f"Response details: Status={e.response.status_code}, Headers={e.response.headers}")
        raise
    except Exception as e:
        logger.error(f"Error during API test: {e}")
        logger.debug(f"Exception details: {e.__cause__ if hasattr(e, '__cause__') else 'No cause info'}")
        raise


async def run_tests():
    """Run tests with different providers."""
    logger.debug("Starting test run")

    # Test with Ollama
    logger.debug("Running Ollama test")
    await test_caption_generation("ollama")

    # Test with Gemini
    logger.debug("Running Gemini test")
    await test_caption_generation("gemini")

    logger.debug("Test run completed")


if __name__ == "__main__":
    # Run all tests
    logger.debug("Initializing test script")
    asyncio.run(run_tests())
