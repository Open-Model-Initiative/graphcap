#!/usr/bin/env python3
"""
# SPDX-License-Identifier: Apache-2.0
Structured Vision Test with Ollama Client

This script tests the structured vision capabilities of the Ollama client
using the graphcap provider manager.
"""

import asyncio
import base64
import json
import os
from pathlib import Path
from pydantic import BaseModel

from loguru import logger
from graphcap.providers.factory import initialize_provider_manager, get_provider_client
from constants import PROVIDER_CONFIG_PATH, EXAMPLE_CONFIG, StructuredCaption, IMAGE_PATH


async def test_structured_vision():
    """Test structured vision capabilities with Ollama client."""
    # Set up provider configuration
    config_path = os.environ.get("PROVIDER_CONFIG_PATH", PROVIDER_CONFIG_PATH)

    # Create a minimal provider config if it doesn't exist
    if not Path(config_path).exists():
        logger.warning(f"Provider config not found at {config_path}, creating minimal config")
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, "w") as f:
            f.write(EXAMPLE_CONFIG)

    # Initialize provider manager
    provider_manager = initialize_provider_manager(config_path)

    # Get the Ollama client
    try:
        client = get_provider_client("ollama")
        logger.info(f"Successfully initialized Ollama client with model: {client.default_model}")

        # Debug the base URL
        logger.info(f"Client base URL: {client.base_url}")
    except Exception as e:
        logger.error(f"Failed to initialize Ollama client: {e}")
        return

    # Define the image path
    image_path = IMAGE_PATH
    if not Path(image_path).exists():
        logger.error(f"Test image not found at {image_path}")
        return

    # Define the prompt
    prompt = (
        "Analyze the provided image and generate a structured caption. "
        "Include a brief scratchpad of your thought process and a final concise caption."
    )

    try:
        # Call the vision method with structured output
        completion = await client.vision(
            prompt=prompt,
            image=image_path,
            model=client.default_model,
            schema=StructuredCaption,
            temperature=0.7,
        )

        # Process the response
        if hasattr(completion, "choices") and hasattr(completion.choices[0].message, "parsed"):
            # Access the parsed response
            parsed_response = completion.choices[0].message.parsed

            # Display as formatted JSON
            logger.info("Structured Caption (JSON):")
            formatted_json = json.dumps(parsed_response.model_dump(), indent=2)
            print(formatted_json)
        else:
            logger.error("Unexpected response format")
            print("Raw response:", completion)

    except Exception as e:
        logger.error(f"Error during structured vision test: {e}")


if __name__ == "__main__":
    # Run the async test
    asyncio.run(test_structured_vision())
