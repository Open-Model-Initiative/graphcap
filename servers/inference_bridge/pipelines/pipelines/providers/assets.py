# SPDX-License-Identifier: Apache-2.0
"""Assets for loading provider configurations."""

import dagster as dg

from graphcap.providers.types import ProviderConfig

from ..common.resources import ProviderConfigFile

deprecation_msg = "Provider configuration is now managed by the data service"

@dg.asset(compute_kind="python", group_name="providers")
def provider_list(
    context: dg.AssetExecutionContext, provider_config_file: ProviderConfigFile
) -> dict[str, ProviderConfig]:
    """Loads the list of providers (now from data service API)."""
    # TODO: Call data service API to get providers instead of loading from file
    # For now, return an empty dictionary to avoid errors
    context.log.info(deprecation_msg)
    
    # Sample provider for testing
    gemini_config = ProviderConfig(
        kind="gemini",
        environment="cloud",
        env_var="GOOGLE_API_KEY",
        base_url="https://generativelanguage.googleapis.com/v1beta",
        models=["gemini-2.0-flash-exp"],
        fetch_models=False,
    )
    
    providers = {"gemini": gemini_config}
    
    context.add_output_metadata(
        {
            "num_providers": len(providers),
            "providers": "gemini: gemini-2.0-flash-exp",
            "note": deprecation_msg
        }
    )
    return providers


@dg.asset(compute_kind="python", group_name="providers")
def default_provider(context: dg.AssetExecutionContext, provider_config_file: ProviderConfigFile) -> str | None:
    """Returns the default provider."""
    selected_provider_name = provider_config_file.default_provider
    context.log.info(f"Using default provider: {selected_provider_name}")
    
    context.add_output_metadata(
        {
            "selected_provider": selected_provider_name,
                "note": deprecation_msg
        }
    )
    return selected_provider_name
