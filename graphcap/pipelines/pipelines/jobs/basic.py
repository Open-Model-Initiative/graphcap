"""
# SPDX-License-Identifier: Apache-2.0
OMI Basic Pipeline Job
"""

import dagster as dg

basic_caption_pipeline = dg.define_asset_job(
    name="basic_caption_pipeline",
    selection=[
        "image_dataset_config",
        "default_provider",
        "image_list",
        "perspective_list",
        "perspective_caption",
        "caption_output_files",
    ],
    description="Basic caption pipeline, graphcap's \"hello world\" example",
)
