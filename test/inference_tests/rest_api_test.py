#!/usr/bin/env python3
"""
# SPDX-License-Identifier: Apache-2.0
REST API Test for Graphcap

This script tests the REST API endpoint for generating captions using httpx.
"""

import asyncio
import json
from typing import List, Optional

import httpx
from loguru import logger
from pydantic import BaseModel

# Constants
API_BASE_URL = "http://localhost:32100/api/v1"
IMAGE_PATH = "/workspace/datasets/os_img/big-buddha-5587706_1280.jpg"

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

async def test_caption_generation(provider: str):
    """Test the caption generation REST API endpoint.
    
    Args:
        provider: The provider to use for caption generation (e.g., 'ollama' or 'gemini')
    """
    logger.info(f"\n{'='*50}\nTesting with {provider.upper()} provider\n{'='*50}")

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
        global_context="You are a structured captioning model."
    )

    endpoint = f"{API_BASE_URL}/perspectives/caption-from-path"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Sending request to {endpoint}")
            logger.info(f"Request payload: {request.model_dump_json(indent=2)}")

            response = await client.post(
                endpoint,
                json=request.model_dump(),
                headers={
                    "accept": "application/json",
                    "Content-Type": "application/json"
                }
            )

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
            else:
                logger.warning("No structured result found in response")

            if "raw_text" in data:
                logger.info("\nRaw Text:")
                logger.info(data["raw_text"])

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"Error during API test: {e}")
        raise

async def run_tests():
    """Run tests with different providers."""
    # Test with Ollama
    await test_caption_generation("ollama")

    # Test with Gemini
    await test_caption_generation("gemini")

if __name__ == "__main__":
    # Run all tests
    asyncio.run(run_tests())
