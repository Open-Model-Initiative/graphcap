# SPDX-License-Identifier: Apache-2.0
"""Module for generating dataset README content."""

from typing import List


def generate_readme_content(
    dataset_name: str,
    dataset_description: str,
    dataset_tags: List[str],
    perspective_results_len: int,
) -> str:
    """Generates the content for the dataset README.md file."""
    readme_content = f"""---
language:
  - en
license: cc0-1.0
pretty_name: {dataset_name}
dataset_info:
  features:
    - name: file_name
      dtype: string
    - name: image
      dtype: image
    - name: config_name
      dtype: string
    - name: version
      dtype: string
    - name: model
      dtype: string
    - name: provider
      dtype: string
    - name: parsed
      struct:
        - name: tags_list
          sequence: string
        - name: short_caption
          dtype: string
        - name: verification
          dtype: string
        - name: dense_caption
          dtype: string
  splits:
    - name: default
      num_examples: {perspective_results_len}
  download_size: null
  dataset_size: null
configs:
  - config_name: default
    data_files:
      - split: default
        path: data/metadata.jsonl
tags:
  - image-to-text
  - computer-vision
  - image-captioning
{chr(10).join([f"  - {tag}" for tag in dataset_tags])}
---

# {dataset_name}

{dataset_description}

## Dataset Structure

The dataset contains images with associated metadata including captions, tags, and verification information.
"""
    return readme_content
