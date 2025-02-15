"""
# SPDX-License-Identifier: Apache-2.0
Image Metadata Pipeline Job

Orchestrates the image metadata pipeline for open datasets.

"""

import dagster as dg

image_metadata_pipeline = dg.define_asset_job(
    name="image_index_pipeline",
    selection=[
        "image_dataset_config",
        "image_list",
        "image_list_exif_data",
        "iptc_metadata",
        "xmp_metadata",
    ],
    description="Indexing images and storing metadata.",
)
