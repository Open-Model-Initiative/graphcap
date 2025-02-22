"""
# SPDX-License-Identifier: Apache-2.0
OMI Basic Pipeline Job
"""

import dagster as dg

basic_perspective_pipeline = dg.define_asset_job(
    name="basic_perspective_pipeline",
    selection=[
        "perspective_pipeline_run_config",
    ],
    description="Basic perspective pipeline, graphcap's \"hello world\" example",
)
