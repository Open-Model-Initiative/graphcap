"""
# SPDX-License-Identifier: Apache-2.0
Hugging Face Perspective Export Module

Provides functionality to export perspective caption results to Hugging Face Hub datasets.
"""

from typing import Any, Dict, List

import dagster as dg
from datasets import Dataset, Features, Image, Value
from huggingface_hub import HfApi


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


def upload_perspective_dataset_to_huggingface(
    hf_dataset: Dataset,
    dataset_name: str,
    namespace: str,
    huggingface_client: HfApi,
    private_dataset: bool = False,
) -> str:
    """
    Uploads a Hugging Face Dataset to the Hugging Face Hub.

    Args:
        hf_dataset: The Hugging Face Dataset to upload.
        dataset_name: Name of the dataset on Hugging Face Hub.
        namespace: Hugging Face Hub namespace (user or organization).
        huggingface_client: Hugging Face API client resource.
        private_dataset: Whether the dataset should be private. Defaults to False.

    Returns:
        The URL of the uploaded dataset.
    """
    try:
        repo_id = f"{namespace}/{dataset_name}"
        dg.get_logger().info(f"Pushing dataset to Hugging Face Hub: {repo_id}")
        hf_dataset.push_to_hub(repo_id, token=huggingface_client.token, private=private_dataset)
        dataset_url = f"https://huggingface.co/datasets/{repo_id}"
        dg.get_logger().info(f"Dataset uploaded successfully to {dataset_url}")
        return dataset_url
    except Exception as e:
        dg.get_logger().error(f"Error uploading dataset to Hugging Face Hub: {e}")
        raise
