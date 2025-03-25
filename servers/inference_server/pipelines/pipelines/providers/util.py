from graphcap.providers.factory import create_provider_client
from ..perspectives.jobs.config import PerspectivePipelineConfig


def get_provider(config_path: str, default_provider: str):
    """Instantiates the client based on the provider configuration.

    Args:
        config_path (str): Path to the provider configuration file (deprecated).
        default_provider (str): The name of the default provider.

    Returns:
        The instantiated client.
    """
    # TODO: Get provider configuration from the data service API
    # For now, hardcode a default configuration for Gemini
    raise NotImplementedError("v2 provider configuration not implemented")
    client = create_provider_client(
        name=default_provider,
        kind="gemini",
        environment="cloud", 
        base_url="https://generativelanguage.googleapis.com/v1beta",
        api_key="",  # API key will be retrieved from environment variable
        default_model="gemini-2.0-flash-exp",
    )
    return client
