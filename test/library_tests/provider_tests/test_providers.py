"""
# SPDX-License-Identifier: Apache-2.0
graphcap.tests.lib.providers.test_providers

Integration tests for provider clients and functionality.

Key features:
- Provider client initialization and configuration
- Vision model testing for each provider
- Structured output validation
- Chat completion testing
- Model availability checks

Classes:
    TestGeminiProvider: Tests for Gemini API integration
    TestOllamaProvider: Tests for Ollama local deployment
    TestVLLMProvider: Tests for VLLM local deployment
    TestOpenRouterProvider: Tests for OpenRouter API integration
    TestOpenAIVisionProvider: Tests for OpenAI vision capabilities
"""

import os

import httpx
import pytest
from dotenv import load_dotenv
from loguru import logger
from pydantic import BaseModel

from graphcap.providers.clients import (
    GeminiClient,
    OllamaClient,
    OpenAIClient,
    OpenRouterClient,
    VLLMClient,
)
from graphcap.providers.provider_manager import ProviderManager

from dataclasses import dataclass

from pydantic import BaseModel


@dataclass
class StructuredVisionConfig:
    config_name: str
    version: str
    prompt: str
    schema: BaseModel

class TestStructuredOutput(BaseModel):
    is_cat: bool
    caption: str


test_vision_config = StructuredVisionConfig(
    prompt="Is this a cat? What does it look like?", schema=TestStructuredOutput, config_name="test", version="1"
)


# Load environment variables from .env
load_dotenv()

pytestmark = pytest.mark.asyncio  # Mark all tests in module as async


@pytest.fixture(scope="function")
async def provider_manager():
    """Initialize provider manager with test config"""
    manager = ProviderManager("./tests/provider.test.config.toml")
    try:
        yield manager
    finally:
        # Add cleanup if needed
        for client in manager.clients().values():
            if hasattr(client, "aclose"):
                await client.aclose()


@pytest.fixture(scope="session")
async def http_client():
    """Fixture to provide an async HTTP client"""
    client = httpx.AsyncClient()
    try:
        yield client
    finally:
        await client.aclose()


@pytest.mark.integration
@pytest.mark.gemini
class TestGeminiProvider:
    @pytest.fixture(autouse=True)
    def check_gemini_api_key(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            pytest.skip("No GOOGLE_API_KEY found. Skipping Gemini tests.")

    async def test_gemini_chat_completion(self, test_logger, provider_manager):
        """
        GIVEN a Gemini client with valid API key
        WHEN making a simple chat completion request
        THEN should return a valid response with expected structure
        AND should contain non-empty message content
        """
        client = provider_manager.get_client("gemini")
        completion = await client.chat.completions.create(
            model=client.default_model,
            messages=[{"role": "user", "content": "Say hello in 5 words or less."}],
            max_tokens=20,
        )

        test_logger("gemini_chat_completion", completion.model_dump())

        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"

    async def test_gemini_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN a Gemini client and a test image
        WHEN requesting vision analysis
        THEN should return a valid description of the image
        AND should have proper response structure
        """
        client = provider_manager.get_client("gemini")
        image_path = provider_artifacts_dir / "test_image.png"

        completion = await client.vision(
            prompt="What's in this image? Describe it briefly.",
            image=image_path,
            model=client.default_model,
            max_tokens=100,
        )

        test_logger("gemini_vision", completion.model_dump())

        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"

    async def test_gemini_structured_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN a Gemini client and a test image
        WHEN requesting structured vision analysis with schema
        THEN should return data matching the specified schema
        AND should contain valid boolean and string fields
        """
        client = provider_manager.get_client("gemini")
        image_path = provider_artifacts_dir / "test_image.png"
        await run_structured_vision(client, test_logger, image_path)


@pytest.mark.integration
@pytest.mark.ollama
class TestOllamaProvider:
    @pytest.fixture(autouse=True)
    async def check_ollama_available(self, provider_manager):
        try:
            client = provider_manager.get_client("ollama")
            await client.get_models()
        except Exception:
            pytest.skip("Ollama service not available. Skipping Ollama tests.")

    async def test_ollama_chat_completion(self, provider_manager):
        """
        GIVEN an Ollama client with available service
        WHEN making a simple chat completion request
        THEN should return a valid response
        AND should contain non-empty message content
        """
        client = provider_manager.get_client("ollama")
        completion = await client.chat.completions.create(
            model=client.default_model,
            messages=[{"role": "user", "content": "Say hello in 5 words or less."}],
            max_tokens=20,
        )

        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"


@pytest.mark.integration
@pytest.mark.vllm
class TestVLLMProvider:
    @pytest.fixture(autouse=True)
    async def check_vllm_available(self, provider_manager, http_client):
        try:
            client = provider_manager.get_client("vllm-pixtral")
            healthy = await client.health()
            print(f"VLLM health check response: {healthy}")
            if not healthy:
                raise ConnectionError("VLLM health check failed")
        except Exception as e:
            pytest.skip(f"VLLM service not available. Error: {str(e)}")

    async def test_vllm_chat_completion(self, provider_manager):
        """
        GIVEN a VLLM client with running service
        WHEN making a chat completion request
        THEN should return a valid response
        AND should contain expected message structure
        """
        client = provider_manager.get_client("vllm-pixtral")
        completion = await client.chat.completions.create(
            model=client.default_model,
            messages=[{"role": "user", "content": "Say hello in 5 words or less."}],
            max_tokens=20,
        )

        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"

    async def test_vllm_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN a VLLM client and test image
        WHEN requesting vision analysis
        THEN should return a valid image description
        AND should follow expected response format
        """
        client = provider_manager.get_client("vllm-pixtral")
        image_path = provider_artifacts_dir / "test_image.png"

        completion = await client.vision(
            prompt="What's in this image? Describe it briefly.",
            image=image_path,
            model=client.default_model,
            max_tokens=500,
        )

        test_logger("vllm_vision", completion.model_dump())

        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"

    async def test_vllm_structured_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN a VLLM client and test image
        WHEN requesting structured vision analysis
        THEN should return data matching the schema
        AND should contain valid boolean and string fields
        """
        client = provider_manager.get_client("vllm-pixtral")
        image_path = provider_artifacts_dir / "test_image.png"
        await run_structured_vision(client, test_logger, image_path)


@pytest.mark.integration
@pytest.mark.openrouter
class TestOpenRouterProvider:
    @pytest.fixture(autouse=True)
    def check_openrouter_api_key(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            pytest.skip("No OPENROUTER_API_KEY found. Skipping OpenRouter tests.")

    async def test_openrouter_chat_completion(self, provider_manager):
        """
        GIVEN an OpenRouter client with valid API key
        WHEN making a chat completion request
        THEN should return a valid response
        AND should contain non-empty message content
        AND should handle any API-specific requirements
        """
        client = provider_manager.get_client("openrouter")
        try:
            completion = await client.chat.completions.create(
                model=client.default_model,
                messages=[{"role": "user", "content": "Say hello in 5 words or less."}],
                max_tokens=20,
            )
        except Exception as e:
            pytest.fail(f"OpenRouter chat completion failed: {str(e)}")

        # Add debug logging
        logger.debug(f"OpenRouter completion response: {completion}")

        assert completion is not None, "Completion should not be None"
        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert completion.choices is not None, "Choices should not be None"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"

    async def test_openrouter_models(self, provider_manager):
        """
        GIVEN an OpenRouter client
        WHEN requesting available models
        THEN should return a list of models
        AND should include GPT models in the list
        """
        client = provider_manager.get_client("openrouter")
        models = await client.get_available_models()

        assert hasattr(models, "data"), "Should have 'data' attribute"
        assert len(models.data) > 0, "Should have at least one model"
        assert any("gpt" in model.id for model in models.data), "Should have GPT models available"

    async def test_openrouter_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN an OpenRouter client and test image
        WHEN requesting vision analysis
        THEN should return a valid image description
        AND should handle potential API errors gracefully
        """
        client = provider_manager.get_client("openrouter")
        image_path = provider_artifacts_dir / "test_image.png"

        try:
            completion = await client.vision(
                prompt="What's in this image? Describe it briefly.",
                image=image_path,
                model=client.default_model,
            )
        except Exception as e:
            pytest.fail(f"OpenRouter vision completion failed: {str(e)}")

        test_logger("openrouter_vision", completion.model_dump())
        logger.debug(f"OpenRouter vision response: {completion}")

        assert completion is not None, "Completion should not be None"
        assert hasattr(completion, "choices"), "Should have 'choices' attribute"
        assert completion.choices is not None, "Choices should not be None"
        assert len(completion.choices) > 0, "Should have at least one choice"
        assert hasattr(completion.choices[0], "message"), "Choice should have a message"
        assert isinstance(completion.choices[0].message.content, str), "Message should be string"
        assert len(completion.choices[0].message.content) > 0, "Message should not be empty"

    async def test_openrouter_structured_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN an OpenRouter client and test image
        WHEN requesting structured vision analysis
        THEN should return data matching the schema
        AND should handle JSON parsing correctly
        """
        client = provider_manager.get_client("openrouter")
        image_path = provider_artifacts_dir / "test_image.png"
        await run_structured_vision(client, test_logger, image_path)


@pytest.mark.asyncio
@pytest.mark.integration
@pytest.mark.provider
async def test_provider_manager_initialization(provider_manager):
    """
    GIVEN a provider configuration file
    WHEN initializing the ProviderManager
    THEN should create appropriate client instances
    AND should match each provider with correct client type
    """
    # Get all configured providers
    provider_configs = provider_manager.providers
    assert provider_configs, "Should have providers configured"

    # Initialize each provider that has required environment variables
    expected_clients = {}
    for name, config in provider_configs.items():
        # Skip providers that need API keys if they're not available
        if config.env_var != "NONE" and not os.getenv(config.env_var):
            continue

        try:
            client = provider_manager.get_client(name)
            expected_clients[name] = client
        except Exception as e:
            logger.warning(f"Could not initialize {name}: {str(e)}")

    # Now check all initialized clients
    clients = provider_manager.clients()
    assert clients, "Should have at least one client initialized"
    assert len(clients) == len(expected_clients), "Should have all available clients initialized"

    # Test specific provider types
    for provider_name, client in clients.items():
        assert client is not None, f"Client for {provider_name} should not be None"
        config = provider_configs[provider_name]

        # Verify client type matches provider kind
        expected_type = {
            "openai": OpenAIClient,
            "gemini": GeminiClient,
            "ollama": OllamaClient,
            "vllm": VLLMClient,
            "openrouter": OpenRouterClient,
        }.get(config.kind)

        assert isinstance(client, expected_type), f"{provider_name} client should be {expected_type.__name__}"


@pytest.mark.integration
@pytest.mark.openai
class TestOpenAIVisionProvider:
    @pytest.fixture(autouse=True)
    def check_openai_api_key(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            pytest.skip("No OPENAI_API_KEY found. Skipping OpenAI Vision tests.")

    @pytest.mark.asyncio
    async def test_openai_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN an OpenAI client
        WHEN requesting image analysis
        THEN should return a coherent description
        AND should handle the image format correctly
        """
        client = provider_manager.get_client("openai")
        image_path = provider_artifacts_dir / "test_image.png"

        completion = await client.vision(
            prompt="What's in this image? Describe it briefly.",
            image=image_path,
            model=client.default_model,
            max_tokens=300,
        )

        test_logger("openai_vision", completion.model_dump())
        assert completion.choices[0].message.content, "Expected non-empty response"

    async def test_openai_structured_vision(self, test_logger, provider_manager, provider_artifacts_dir):
        """
        GIVEN an OpenAI client and test image
        WHEN requesting structured vision analysis
        THEN should return data matching the schema
        AND should parse JSON response correctly
        """
        client = provider_manager.get_client("openai")
        image_path = provider_artifacts_dir / "test_image.png"
        await run_structured_vision(client, test_logger, image_path)


async def run_structured_vision(client, test_logger, image_path):
    """
    Helper function to test structured vision capabilities:
        GIVEN a vision-capable client and test image
        WHEN running structured vision analysis
        THEN should return properly formatted data
        AND should validate against the schema
    """
    completion = await client.vision(
        prompt=test_vision_config.prompt,
        image=image_path,
        schema=test_vision_config.schema,
        model=client.default_model,
        max_tokens=1000,
    )

    test_logger(f"{client.name}_structured_vision", completion.model_dump())

    # If the response is already a Pydantic model
    if isinstance(completion, TestStructuredOutput):
        assert isinstance(completion.is_cat, bool), "is_cat should be boolean"
        assert isinstance(completion.caption, str), "caption should be string"
        assert len(completion.caption) > 0, "caption should not be empty"
        return

    # For providers that return raw completion
    assert hasattr(completion, "choices"), "Should have 'choices' attribute"
    assert len(completion.choices) > 0, "Should have at least one choice"
    assert hasattr(completion.choices[0], "message"), "Choice should have a message"
    content = completion.choices[0].message.content
    assert isinstance(content, str), "Message should be string"
    assert len(content) > 0, "Message should not be empty"
