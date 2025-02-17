# SPDX-License-Identifier: Apache-2.0
"""Module for preparing datasets for Hugging Face Hub."""

from typing import Any, Dict, List

import dagster as dg
from datasets import Dataset, Features, Image, Value


def create_huggingface_dataset(perspective_results: List[Dict[str, Any]]) -> Dataset:
    """
    Creates a Hugging Face Dataset from perspective caption results.

    Args:
        perspective_results: List of dictionaries containing perspective caption results.

    Returns:
        A Hugging Face Dataset.
    """
    # Define dataset features based on perspective results structure
    features = Features(
        {
            "filename": Value("string"),
            "config_name": Value("string"),
            "version": Value("string"),
            "model": Value("string"),
            "provider": Value("string"),
            "parsed": Value("json"),  # Assuming parsed results are JSON serializable
            "image": Image(),  # Add Image feature for image data
        }
    )

    # Prepare data for dataset creation
    dataset_data = []
    for result in perspective_results:
        try:
            image_path = result.get("filename")
            if image_path:
                dataset_data.append(
                    {
                        "filename": result["filename"],
                        "config_name": result["config_name"],
                        "version": result["version"],
                        "model": result["model"],
                        "provider": result["provider"],
                        "parsed": result["parsed"],
                        "image": image_path,  # Load image for dataset
                    }
                )
        except Exception as e:
            dg.get_logger().error(f"Error preparing data for HuggingFace dataset: {e}")
            continue

    # Create Hugging Face Dataset
    hf_dataset = Dataset.from_list(dataset_data, features=features)
    return hf_dataset
