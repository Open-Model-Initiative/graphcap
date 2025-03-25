"""
# SPDX-License-Identifier: Apache-2.0
graphcap.tests.lib.providers.test_provider_factory

Tests for provider factory functionality.

Key features:
- Provider client creation and caching
- Environment validation
- Client-specific configurations
"""

import pytest
from unittest.mock import patch, MagicMock

from graphcap.providers.factory import (
    ProviderFactory,
    create_provider_client,
    get_provider_factory,
    clear_provider_cache
)
from graphcap.providers.types import ProviderConfig, RateLimits


def test_provider_factory_initialization():
    """
    GIVEN a provider factory
    WHEN initializing a new instance
    THEN should create an empty client cache
    """
    factory = ProviderFactory()
    assert hasattr(factory, '_client_cache')
    assert factory._client_cache == {}


@pytest.mark.parametrize(
    "provider_config",
    [
        {
            "name": "test-openai",
            "kind": "openai",
            "environment": "cloud",
            "base_url": "https://api.openai.com/v1",
            "api_key": "test-key",
            "default_model": "gpt-4o-mini",
        },
        {
            "name": "test-gemini",
            "kind": "gemini",
            "environment": "cloud",
            "base_url": "https://generativelanguage.googleapis.com/v1beta",
            "api_key": "test-key",
            "default_model": "gemini-2.0-flash-exp",
        },
    ],
)
@patch("graphcap.providers.factory.get_client")
def test_create_client(mock_get_client, provider_config):
    """
    GIVEN valid provider configurations
    WHEN creating a client
    THEN should call get_client with correct parameters
    AND should return the expected client instance
    """
    # Setup mock
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client

    # Create factory and client
    factory = ProviderFactory()
    client = factory.create_client(**provider_config)

    # Verify
    mock_get_client.assert_called_once_with(
        name=provider_config["name"],
        kind=provider_config["kind"],
        environment=provider_config["environment"],
        api_key=provider_config["api_key"],
        base_url=provider_config["base_url"],
        default_model=provider_config["default_model"],
    )
    assert client == mock_client


@patch("graphcap.providers.factory.get_client")
def test_client_caching(mock_get_client):
    """
    GIVEN a client that has been created
    WHEN creating the same client again
    THEN should return the cached client
    AND should not call get_client again
    """
    # Setup mock
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client

    # Create configuration
    config = {
        "name": "test-openai",
        "kind": "openai",
        "environment": "cloud",
        "base_url": "https://test.com",
        "api_key": "test-key",
        "default_model": "test-model",
    }

    # Create factory and client
    factory = ProviderFactory()
    
    # First call should create the client
    client1 = factory.create_client(**config, use_cache=True)
    assert mock_get_client.call_count == 1
    
    # Second call should use cached client
    client2 = factory.create_client(**config, use_cache=True)
    assert mock_get_client.call_count == 1  # Count should still be 1
    assert client1 is client2  # Should be the same instance
    
    # Call with use_cache=False should create a new client
    client3 = factory.create_client(**config, use_cache=False)
    assert mock_get_client.call_count == 2  # Count should now be 2
    assert client1 is not client3  # Should be different instances


def test_clear_cache():
    """
    GIVEN a factory with cached clients
    WHEN clearing the cache
    THEN should remove all cached clients
    """
    with patch("graphcap.providers.factory.get_client") as mock_get_client:
        # Setup mock
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        
        # Create factory and add some clients to cache
        factory = ProviderFactory()
        factory.create_client(
            name="test1",
            kind="openai",
            environment="cloud",
            base_url="https://test1.com",
            api_key="key1",
            default_model="model1",
        )
        factory.create_client(
            name="test2",
            kind="gemini",
            environment="cloud",
            base_url="https://test2.com",
            api_key="key2",
            default_model="model2",
        )
        
        # Verify cache has clients
        assert len(factory._client_cache) == 2
        
        # Clear cache
        factory.clear_cache()
        
        # Verify cache is empty
        assert len(factory._client_cache) == 0


@patch("graphcap.providers.factory._provider_factory", None)
@patch("graphcap.providers.factory.ProviderFactory")
def test_get_provider_factory(mock_factory_class):
    """
    GIVEN no existing provider factory
    WHEN calling get_provider_factory
    THEN should create a new factory instance
    """
    # Setup mock
    mock_factory = MagicMock()
    mock_factory_class.return_value = mock_factory
    
    # Call function
    factory = get_provider_factory()
    
    # Verify
    mock_factory_class.assert_called_once()
    assert factory == mock_factory


@patch("graphcap.providers.factory.get_provider_factory")
def test_create_provider_client(mock_get_factory):
    """
    GIVEN valid provider configuration
    WHEN calling create_provider_client
    THEN should get factory and call create_client
    """
    # Setup mock
    mock_factory = MagicMock()
    mock_client = MagicMock()
    mock_factory.create_client.return_value = mock_client
    mock_get_factory.return_value = mock_factory
    
    # Call function
    config = {
        "name": "test",
        "kind": "openai",
        "environment": "cloud",
        "base_url": "https://test.com",
        "api_key": "test-key",
        "default_model": "test-model",
    }
    client = create_provider_client(**config)
    
    # Verify
    mock_get_factory.assert_called_once()
    mock_factory.create_client.assert_called_once_with(**config)
    assert client == mock_client


@patch("graphcap.providers.factory._provider_factory")
def test_clear_provider_cache(mock_factory):
    """
    GIVEN an existing provider factory
    WHEN calling clear_provider_cache
    THEN should call clear_cache on the factory
    """
    # Call function
    clear_provider_cache()
    
    # Verify
    mock_factory.clear_cache.assert_called_once() 