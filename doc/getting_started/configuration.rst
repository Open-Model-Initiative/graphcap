.. _configuration:

Configuration
============

Initial Setup
------------

Graphcap provides a setup script to help you configure your environment and provider settings. 
You can run the setup using:

.. code-block:: bash
   task setup 


To run without reinstalling the venv, you can run:

.. code-block:: bash
   uv run python -m src.scripts

This interactive script will:

1. Create or update your ``.env`` file with provider settings
2. Create or update your provider configuration in ``workspace/config/provider.config.toml``

Environment Variables
-------------------

The setup script will help you configure the following environment variables based on your 
selected providers:

- ``HUGGING_FACE_HUB_TOKEN``: API token for Hugging Face Hub
- ``OPENAI_API_KEY``: API key for OpenAI services
- ``GOOGLE_API_KEY``: API key for Google services
- ``VLLM_BASE_URL``: Base URL for vLLM service
- ``OLLAMA_BASE_URL``: Base URL for Ollama service

Provider Configuration
--------------------

The provider configuration file (``workspace/config/provider.config.toml``) defines settings for 
each enabled provider. 

Updating Configuration
--------------------

You can rerun the setup script at any time to update your configuration:

.. code-block:: bash

   uv run python -m src.scripts

The script will:

- Detect existing configuration files
- Ask for permission before overwriting
- Preserve existing settings when updating
- Allow you to enable/disable providers
- Update API keys and settings as needed

.. warning::
   Be careful when overwriting existing configuration files. 
   The setup script will ask for confirmation before making changes.

Configuration Location
--------------------

- Environment variables: ``.env`` in the project root
- Provider configuration: ``workspace/config/provider.config.toml``

These files are automatically loaded when running Graphcap services.
