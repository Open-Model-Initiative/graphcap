"""
# SPDX-License-Identifier: Apache-2.0
OMI Perspective Pipeline Job

Orchestrates the perspective-based image captioning pipeline for OMI datasets.

    This job implements a distributed captioning approach, where different "perspectives"
    (e.g., GraphCaption, ArtCritic) are applied to images to generate diverse and
    structured annotations. The pipeline is designed to be part of the OMI Distributed
    Captioning System, as detailed in the архитектура RFC.

    It performs the following steps:
    1. Loads images from a specified directory (currently stubbed).
    2. Applies perspective-based captioning (currently stubbed, expects input `perspective_results`).
    3. Exports the generated perspective captions as a Hugging Face dataset.

    The job is configured to:
    - Utilize a local captioning environment for processing.
    - Upload datasets to a central Hugging Face Hub repository.
    - Support different caption perspectives for enriched annotations.

    Args:
        context (dg.AssetExecutionContext): Dagster execution context.
        perspective_results (List[Dict[str, Any]]): List of perspective caption results
            (currently expected as input, actual generation is stubbed).
        dataset_name (str): Name for the Hugging Face dataset.
        namespace (str): Hugging Face namespace (user or organization).
        hf_token (dg.Secret): Hugging Face API token for dataset upload.
        image_list (List[str]): List of image paths from image_list asset.

    Note:
        - Image loading and perspective captioning steps are currently stubbed and
          need to be implemented with actual logic.
        - The job is intended to be executed within the OMI infrastructure and
          expects specific configurations and secrets to be set up.
"""

import dagster as dg

omi_perspective_pipeline_job = dg.define_asset_job(
    name="omi_perspective_pipeline",
    selection=[
        "perspective_caption",
        "dataset_metadata",
        "dataset_export_manifest",
        "huggingface_upload_manifest",
        "default_provider",
    ],
)
