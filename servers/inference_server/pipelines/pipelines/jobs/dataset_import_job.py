# SPDX-License-Identifier: Apache-2.0
"""
Job definition for importing datasets from Hugging Face Hub.

This module defines a job that orchestrates the download and parsing of datasets
from the Hugging Face Hub. The job consists of two assets:

1. dataset_download: Downloads a dataset using the configured method (Git LFS, datasets library, or direct file)
2. dataset_parse: Parses the downloaded dataset and creates a standardized manifest

Example:
    To run this job with default configuration:
    ```
    dagster job execute -j dataset_import_job
    ```

    To run with custom configuration:
    ```
    dagster job execute -j dataset_import_job -c config.yaml
    ```

    Example config.yaml:
    ```yaml
    ops:
      dataset_download:
        config:
          repo_id: "openmodelinitiative/initial-test-dataset"
          local_dir: "/workspace/.local/output/dataset"
          use_git_lfs: true
          fresh_clone: true
      dataset_parse:
        config:
          output_dir: "/workspace/.local/output/dataset"
    ```
"""

import dagster as dg

dataset_import_job = dg.define_asset_job(
    name="dataset_import_job",
    selection=[
        "dataset_download",
        "dataset_parse",
        "dataset_download_urls",
    ],
    description="Downloads and parses a dataset from the Hugging Face Hub.",
)
