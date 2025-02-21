"""
# SPDX-License-Identifier: Apache-2.0
graphcap.tests.lib.providers.test_provider_config

Tests for provider configuration functionality.

Key features:
- Provider configuration loading and validation
- Default model handling and propagation
- Environment and model configuration verification

Classes:
    None (contains test functions only)
"""


import pytest

from graphcap.providers.provider_config import _load_provider_config, get_providers_config, validate_config
from graphcap.providers.provider_manager import ProviderManager


def test_load_provider_config(provider_artifacts_dir):
    """
    GIVEN a valid provider configuration file
    WHEN loading and parsing the configuration
    THEN should return all expected providers
    AND each provider should have correct configuration values
    """
    config_path = provider_artifacts_dir / "provider.parse-config.toml"
    providers = _load_provider_config(config_path)

    # Test that we got all expected providers
    expected_providers = {"openai", "gemini", "openrouter", "ollama", "vllm-pixtral", "provider_name"}
    assert set(providers.keys()) == expected_providers

    # Test specific provider configurations
    openai = providers["openai"]
    assert openai["kind"] == "openai"
    assert openai["environment"] == "cloud"
    assert openai["env_var"] == "OPENAI_API_KEY"
    assert openai["base_url"] == "https://api.openai.com/v1"
    assert openai["models"] == ["gpt-4o-mini", "gpt-4o"]
    assert openai["default_model"] == "gpt-4o-mini"

    # Test local provider with fetch_models
    ollama = providers["ollama"]
    assert ollama["kind"] == "ollama"
    assert ollama["environment"] == "local"
    assert ollama["env_var"] == "NONE"
    assert ollama["base_url"] == "https://localhost:11434"
    assert ollama["default_model"] == "llama3.2"
    assert ollama["fetch_models"]

    # Test VLLM provider
    vllm = providers["vllm-pixtral"]
    assert vllm["kind"] == "vllm"
    assert vllm["environment"] == "local"
    assert vllm["env_var"] == "NONE"
    assert vllm["base_url"] == "https://localhost:11435"
    assert vllm["default_model"] == "vision-worker"
    assert vllm["fetch_models"]

    # Test provider with many models
    openrouter = providers["openrouter"]
    assert openrouter["kind"] == "openrouter"
    assert len(openrouter["models"]) == 8  # Check number of models
    assert openrouter["default_model"] == "meta-llama/llama-3.2-90b-vision-instruct:free"


def test_default_model_handling():
    """
    GIVEN different provider configurations
    WHEN parsing provider configs with various model settings
    THEN should handle default model selection correctly
    AND should raise appropriate errors for invalid configurations
    """
    from graphcap.providers.provider_config import _parse_provider_config

    # Test using explicit default_model
    config = {
        "kind": "test",
        "environment": "cloud",
        "env_var": "TEST_KEY",
        "base_url": "http://test.com",
        "models": ["model1", "model2"],
        "default_model": "model2",
    }
    provider = _parse_provider_config(config)
    assert provider.default_model == "model2"

    # Test fallback to first model in list
    config.pop("default_model")
    provider = _parse_provider_config(config)
    assert provider.default_model == "model1"

    # Test error when no models or default_model specified
    config["models"] = []
    with pytest.raises(ValueError, match="Must specify default_model when no models list is provided"):
        _parse_provider_config(config)

    # Test with fetch_models=True requires default_model
    config["fetch_models"] = True
    with pytest.raises(ValueError, match="Must specify default_model when no models list is provided"):
        _parse_provider_config(config)

    # Test with fetch_models=True and default_model works
    config["default_model"] = "runtime-model"
    provider = _parse_provider_config(config)
    assert provider.default_model == "runtime-model"


def test_validate_config(provider_artifacts_dir):
    """
    GIVEN a valid provider configuration
    WHEN validating the configuration
    THEN should return no validation errors
    """
    config_path = provider_artifacts_dir / "provider.parse-config.toml"
    providers = get_providers_config(config_path)
    errors = validate_config(providers)

    assert not errors, f"Unexpected validation errors: {errors}"


def test_validate_config_with_errors():
    """
    GIVEN an invalid provider configuration
    WHEN validating the configuration
    THEN should return appropriate validation errors
    AND should include all expected error messages
    """
    from graphcap.providers.provider_config import ProviderConfig

    invalid_providers = {
        "missing_fields": ProviderConfig(
            kind="",  # Missing kind
            environment="invalid",  # Invalid environment
            env_var="",  # Missing env_var
            base_url="not-a-url",  # Invalid URL
            models=[],
            default_model="",  # Missing default_model
            fetch_models=False,  # No models and fetch_models is False
        )
    }

    errors = validate_config(invalid_providers)
    assert len(errors) == 6  # Should have 6 validation errors now

    error_messages = "\n".join(errors)
    assert "Missing kind" in error_messages
    assert "Environment must be 'cloud' or 'local'" in error_messages
    assert "Missing env_var" in error_messages
    assert "Base URL must start with http:// or https://" in error_messages
    assert "Must specify models list when fetch_models is False" in error_messages
    assert "Missing default_model" in error_messages


def test_missing_config_file():
    """
    GIVEN a non-existent configuration file path
    WHEN attempting to load the configuration
    THEN should raise FileNotFoundError
    """
    with pytest.raises(FileNotFoundError):
        get_providers_config("nonexistent.toml")


def test_provider_completeness(provider_artifacts_dir):
    """
    GIVEN a complete provider configuration file
    WHEN loading all provider configurations
    THEN should have all expected providers
    AND each provider should have correct configuration values
    AND should validate environment settings
    AND should verify model configurations
    """
    config_path = provider_artifacts_dir / "provider.parse-config.toml"
    providers = get_providers_config(config_path)

    # Define expected provider configurations
    expected_providers = {
        "openai": {
            "kind": "openai",
            "environment": "cloud",
            "env_var": "OPENAI_API_KEY",
            "base_url": "https://api.openai.com/v1",
            "has_models": True,
            "fetch_models": False,
        },
        "gemini": {
            "kind": "gemini",
            "environment": "cloud",
            "env_var": "GOOGLE_API_KEY",
            "base_url": "https://generativelanguage.googleapis.com/v1beta",
            "has_models": True,
            "fetch_models": False,
        },
        "openrouter": {
            "kind": "openrouter",
            "environment": "cloud",
            "env_var": "OPENROUTER_API_KEY",
            "base_url": "https://openrouter.ai/api/v1",
            "has_models": True,
            "fetch_models": False,
        },
        "ollama": {
            "kind": "ollama",
            "environment": "local",
            "env_var": "NONE",
            "base_url": "http://localhost:11434",
            "has_models": False,
            "fetch_models": True,
        },
        "vllm-pixtral": {
            "kind": "vllm",
            "environment": "local",
            "env_var": "NONE",
            "base_url": "http://localhost:11435",
            "has_models": False,
            "fetch_models": True,
        },
        "provider_name": {
            "kind": "vllm",
            "environment": "cloud",
            "env_var": "API_KEY",
            "base_url": "https://runpod.net/api/v1",
            "has_models": True,
            "fetch_models": False,
        },
    }

    # Verify all expected providers are present
    assert set(providers.keys()) == set(expected_providers.keys()), "Missing or unexpected providers"

    # Verify each provider's configuration
    for name, expected in expected_providers.items():
        provider = providers[name]
        assert provider.kind == expected["kind"], f"Wrong kind for {name}"
        assert provider.environment == expected["environment"], f"Wrong environment for {name}"
        assert provider.env_var == expected["env_var"], f"Wrong env_var for {name}"
        assert provider.base_url == expected["base_url"], f"Wrong base_url for {name}"
        assert bool(provider.models) == expected["has_models"], f"Wrong models status for {name}"
        assert provider.fetch_models == expected["fetch_models"], f"Wrong fetch_models for {name}"


@pytest.mark.integration
def test_default_model_propagation(provider_artifacts_dir):
    """
    GIVEN a provider manager with configuration
    WHEN initializing provider clients
    THEN should correctly set default models for each provider
    AND should handle both local and cloud providers
    """
    config_path = provider_artifacts_dir / "provider.parse-config.toml"
    manager = ProviderManager(config_path)

    # Test providers with different model configurations
    test_cases = [
        ("ollama", "llama3.2"),  # Local provider with no models list
        ("vllm-pixtral", "vision-worker"),  # Another local provider
        ("openai", "gpt-4o-mini"),  # Cloud provider with models list
    ]

    for provider_name, expected_model in test_cases:
        client = manager.get_client(provider_name)
        assert client.default_model == expected_model, (
            f"Wrong default model for {provider_name}. Expected {expected_model}, got {client.default_model}"
        )
