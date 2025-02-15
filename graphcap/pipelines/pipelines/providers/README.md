# Provider Management System

A flexible provider management system for handling multiple AI service providers with an OpenAI-compatible interface.

## Overview

This system provides a unified way to manage and interact with different AI providers, including cloud-based and custom implementations. It supports standard chat completions, vision capabilities, and structured outputs across providers.

## Configuration

### Provider Config File (provider.config.toml)

The system is configured using a TOML file that defines both cloud and custom providers:

```toml
[provider.cloud.openai]
api_key = "OPENAI_API_KEY"
base_url = "https://api.openai.com/v1"
models = ["gpt-4-vision", "gpt-4"]

[provider.cloud.gemini]
api_key = "GOOGLE_API_KEY"
base_url = "https://generativelanguage.googleapis.com/v1beta"
models = ["gemini-2.0-flash-exp"]

[provider.cloud.openrouter]
api_key = "OPENROUTER_API_KEY"
base_url = "https://openrouter.ai/api/v1"
models = ["openai/gpt-4", "google/gemini-2.0-flash-exp:free"]

[providers.custom.ollama]
api_key = ""
base_url = "http://localhost:11434"
fetch_models = true

[providers.custom.vllm-pixtral]
api_key = ""
base_url = "http://localhost:11435"
models = ["vision-worker"]
```

### Provider Types

1. Cloud Providers (`provider.cloud.*`)
   - OpenAI
   - Gemini
   - OpenRouter

2. Custom Providers (`providers.custom.*`)
   - Ollama
   - VLLM
   - Other custom implementations

## Usage

### Basic Usage

```python
from graphcap.providers.provider_manager import ProviderManager

# Initialize the manager
manager = ProviderManager("provider.config.toml")

# Get all initialized clients
clients = manager.clients()

# Get a specific client
openai_client = manager.get_client("cloud.openai")
gemini_client = manager.get_client("cloud.gemini")
```

### Provider Clients

All provider clients inherit from BaseClient and implement an OpenAI-compatible interface:

- `OpenAIClient`: Standard OpenAI implementation
- `GeminiClient`: Google's Gemini API implementation
- `OpenRouterClient`: OpenRouter API implementation
- `OllamaClient`: Ollama-specific implementation
- `VLLMClient`: VLLM-specific implementation

### Vision Capabilities

All providers support a unified vision interface:

```python
completion = client.vision(
    prompt="What's in this image?",
    image=image_path,
    model=client.default_model
)
```

### Structured Output

Providers support structured completions using JSON schemas or Pydantic models:

```python
completion = client.create_structured_completion(
    messages=messages,
    schema=MyPydanticModel,
    model="model-name"
)
```

## Features

- **Unified Interface**: All providers use an OpenAI-compatible interface
- **Vision Support**: Standardized vision capabilities across providers
- **Structured Output**: JSON schema and Pydantic model support
- **Configuration Management**: TOML-based configuration
- **Automatic Initialization**: Providers are initialized at startup
- **Error Handling**: Robust error handling with detailed logging
- **Caching**: Clients are cached after initialization

## REST API

The system includes a FastAPI router with endpoints:

- `GET /providers/`: List all available providers
- `GET /providers/{provider_name}`: Get provider details
- `POST /providers/{provider_name}/vision`: Analyze image with provider

## Error Handling

The system includes comprehensive error handling:
- Configuration validation
- Client initialization errors
- Runtime errors with detailed logging
- API error responses

