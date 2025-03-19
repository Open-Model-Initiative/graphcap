from graphcap.providers.provider_config import get_providers_config
from graphcap.providers.clients import get_client
from ..perspectives.jobs.config import PerspectivePipelineConfig


def get_provider(config_path: str, default_provider: str):
    """Instantiates the client based on the provider configuration.

    Args:
        config_path (str): Path to the provider configuration file.
        default_provider (str): The name of the default provider.

    Returns:
        The instantiated client.
    """
    providers = get_providers_config(config_path)
    selected_provider_config = providers[default_provider]
    client_args = {
        "name": default_provider,
        "environment": selected_provider_config.environment,
        "env_var": selected_provider_config.env_var,
        "base_url": selected_provider_config.base_url,
        "default_model": selected_provider_config.default_model,
    }
    client = get_client(selected_provider_config.kind, **client_args)
    return client
