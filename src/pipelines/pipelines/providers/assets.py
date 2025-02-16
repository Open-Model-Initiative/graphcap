# SPDX-License-Identifier: Apache-2.0
"""Assets for loading provider configurations."""

import dagster as dg
from graphcap.providers.provider_config import get_providers_config
from graphcap.providers.types import ProviderConfig

from ..common.resources import ProviderConfigFile


@dg.asset(compute_kind="python", group_name="providers")
def provider_list(
    context: dg.AssetExecutionContext, provider_config_file: ProviderConfigFile
) -> dict[str, ProviderConfig]:
    """Loads the list of providers from the provider.config.toml file."""
    config_path = provider_config_file.provider_config
    try:
        providers = get_providers_config(config_path)
        context.log.info(f"Loaded providers from {config_path}")
        provider_info = [f"{name}: {provider.default_model}" for name, provider in providers.items()]
        context.add_output_metadata(
            {
                "num_providers": len(providers),
                "config_path": config_path,
                "providers": ", ".join(provider_info),
            }
        )
        return providers
    except FileNotFoundError:
        context.log.error(f"Provider config file not found: {config_path}")
        return {}
    except Exception as e:
        context.log.error(f"Error loading provider config: {e}")
        return {}


@dg.asset(compute_kind="python", group_name="providers")
def default_provider(context: dg.AssetExecutionContext, provider_config_file: ProviderConfigFile) -> str | None:
    """Loads the default provider based on the selected_provider config."""
    config_path = provider_config_file.provider_config
    try:
        providers = get_providers_config(config_path)
        selected_provider_name = provider_config_file.default_provider

        if selected_provider_name not in providers:
            context.log.warning(f"Selected provider '{selected_provider_name}' not found in config.")
            return None

        selected_provider_config = providers[selected_provider_name]

        context.log.info(f"Loaded default provider: {selected_provider_name}")
        context.add_output_metadata(
            {
                "selected_provider": selected_provider_name,
                "provider_kind": selected_provider_config.kind,
                "provider_environment": selected_provider_config.environment,
                "provider_default_model": selected_provider_config.default_model,
            }
        )
        return selected_provider_name
    except FileNotFoundError:
        context.log.error(f"Provider config file not found: {config_path}")
        return None
    except Exception as e:
        context.log.error(f"Error loading provider config: {e}")
        return None
