# SPDX-License-Identifier: Apache-2.0
"""
Hugging Face Client Dagster Resource

This module defines a Dagster resource for interacting with the Hugging Face Hub.
It uses environment variables for authentication and provides a configured
Hugging Face API client.

Resources:
    huggingface_client: Dagster resource for Hugging Face API client
"""

import dagster as dg
from huggingface_hub import HfApi


@dg.resource(
    config_schema={"hf_token": dg.String},
    description="""
    This resource provides a configured Hugging Face client.

    Configuration:
        hf_token (EnvVar):
            The Hugging Face Hub API token.
            Sourced from the environment variable HUGGING_FACE_HUB_TOKEN.
    """,
)
def huggingface_client(context) -> HfApi:
    """
    Dagster resource that initializes and provides a Hugging Face API client.

    This resource is configured to authenticate with the Hugging Face Hub using
    a token sourced from the 'HUGGING_FACE_HUB_TOKEN' environment variable.

    Args:
        context (dg.ResourceInitializationContext): Dagster resource initialization context.

    Returns:
        HfApi: Configured Hugging Face API client.
    """
    hf_token = context.resource_config.get("hf_token", dg.EnvVar("HUGGING_FACE_HUB_TOKEN"))
    return HfApi(token=hf_token)
