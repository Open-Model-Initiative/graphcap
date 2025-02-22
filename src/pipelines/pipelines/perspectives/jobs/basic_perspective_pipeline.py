"""
# SPDX-License-Identifier: Apache-2.0
OMI Basic Pipeline Job
"""

import dagster as dg

basic_perspective_pipeline = dg.define_asset_job(
    name="basic_perspective_pipeline",
    selection=[
        "perspective_pipeline_run_config",
        "perspective_image_list",
        "perspective_caption",
        "caption_contexts",
        "synthesizer_caption",
        "caption_output_files",
    ],
    description="Basic perspective pipeline, graphcap's \"hello world\" example",
)
