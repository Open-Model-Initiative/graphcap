from graphcap.providers.provider_config import get_providers_config
from graphcap.providers.clients import get_client
from ..common.resources import ProviderConfigFile

def get_provider(provider_config_file: ProviderConfigFile, default_provider: str):
    """Instantiates the client based on the provider configuration.

    Args:
        provider_config_file (ProviderConfigFile): The configuration for the selected provider.
        default_provider (str): The name of the default provider.

    Returns:
        The instantiated client.
    """
    config_path = provider_config_file.provider_config
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
