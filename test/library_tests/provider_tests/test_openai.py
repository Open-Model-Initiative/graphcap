"""
# SPDX-License-Identifier: Apache-2.0
graphcap.tests.lib.providers.test_openai

Integration tests for OpenAI client functionality.

Key features:
- Model listing and availability
- Basic chat completion functionality
- API key validation
- Response structure verification

Classes:
    None (contains test functions only)
"""

## This tests the unwrapped client. Should help indicate config vs code issues

import os

import pytest
from dotenv import load_dotenv

# Adjust imports as needed depending on your actual project structure
from openai import OpenAI

# Load environment variables from .env (if present)
load_dotenv()


@pytest.fixture(scope="session", autouse=True)
def check_openai_api_key():
    """
    Checks if OPENAI_API_KEY is present; if not, skip these tests.
    This fixture runs once per session, skipping all integration tests if no key.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("No OPENAI_API_KEY found. Skipping integration tests.")


@pytest.mark.integration
def test_list_models(test_logger):
    """
    Simple integration test that calls the real /models endpoint.
    Expects a valid API key to succeed.
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    resp = client.models.list()

    # Log the response
    test_logger("openai_list_models", resp.model_dump())

    # The response is now a SyncPage[Model] object with a 'data' attribute
    assert hasattr(resp, "data"), "Response should have a 'data' attribute"
    assert isinstance(resp.data, list), "'data' should be a list"
    assert len(resp.data) > 0, "Should have at least 1 model returned by the API"


@pytest.mark.integration
def test_basic_chat_completion(test_logger):
    """
    Tests a short chat completion call using a cheap/flexible model (gpt-3.5-turbo).
    We just want to see if it returns a valid response.
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say hello in 5 words or less."}],
        max_tokens=20,
    )

    # Log the response
    test_logger("openai_basic_chat_completion", completion.model_dump())

    # The response is now a ChatCompletion object with a 'choices' attribute
    assert hasattr(completion, "choices"), "Should have 'choices' attribute in chat completion response"
    assert len(completion.choices) > 0, "Should have at least one choice returned"
    assert hasattr(completion.choices[0], "message"), "Choice should have a message"
    assert isinstance(completion.choices[0].message.content, str), "Message content should be a string"
    assert len(completion.choices[0].message.content) > 0, "Expected non-empty response"
