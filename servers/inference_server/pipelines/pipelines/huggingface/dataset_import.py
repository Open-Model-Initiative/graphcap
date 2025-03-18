# SPDX-License-Identifier: Apache-2.0
"""
Assets and ops for importing datasets from Hugging Face Hub.

This module provides assets and functions to download datasets from the Hugging Face Hub.
It supports three methods of downloading:
1. Using Git LFS to clone the entire repository (recommended for full datasets)
2. Using the datasets library (recommended for standardized dataset access)
3. Using huggingface_hub for direct file access (recommended for specific files)

Assets:
    dataset_download: Downloads a dataset using the configured method.
    dataset_parse: Parses the downloaded dataset and saves it to the specified output directory.
"""

import json
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, List

import dagster as dg
import pandas as pd
import requests
from datasets import load_dataset
from huggingface_hub import hf_hub_download
from tqdm import tqdm

from .types import DatasetImportConfig, DatasetParquetUrlDownloadConfig, DatasetParseConfig


def _clone_with_git_lfs(
    repo_id: str, local_dir: Path, context: dg.AssetExecutionContext, fresh_clone: bool = True
) -> None:
    """
    Clones a dataset repository using Git LFS.

    This is the recommended method for downloading complete datasets as it properly
    handles large files and maintains the exact repository structure.
    """
    # Ensure git-lfs is installed
    try:
        subprocess.run(["git", "lfs", "install"], check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError("Failed to initialize Git LFS. Is it installed?") from e

    # Clean up existing directory if it exists
    if local_dir.exists() and fresh_clone:
        context.log.info(f"Cleaning up existing directory: {local_dir}")
        try:
            subprocess.run(["rm", "-rf", str(local_dir)], check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Failed to clean up directory {local_dir}: {e.stderr.decode()}") from e

    # Clone the repository
    repo_url = f"https://huggingface.co/datasets/{repo_id}"
    try:
        subprocess.run(["git", "clone", repo_url, str(local_dir)], check=True, capture_output=True)
        context.log.info(f"Successfully cloned repository {repo_id} to {local_dir}")
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to clone repository {repo_id}: {e.stderr.decode()}") from e


def _download_with_datasets(repo_id: str, local_dir: Path, context: dg.AssetExecutionContext) -> None:
    """
    Downloads a dataset using the datasets library.

    This method is recommended for datasets that follow the Hugging Face datasets format
    and when you want to work with the dataset using the datasets library features.
    """
    try:
        dataset = load_dataset(repo_id, cache_dir=str(local_dir))
        context.log.info(f"Successfully loaded dataset {repo_id} using datasets library")
        # Print dataset info for verification
        context.log.info(f"Dataset structure: {dataset}")
    except Exception as e:
        raise ValueError(f"Failed to load dataset {repo_id} with datasets library: {e}")


def _download_file(repo_id: str, filename: str, local_dir: Path, context: dg.AssetExecutionContext) -> Path:
    """
    Downloads a specific file from the dataset repository.

    This method is recommended when you only need specific files from the dataset.
    """
    try:
        file_path = hf_hub_download(
            repo_id=repo_id, filename=filename, repo_type="dataset", local_dir=str(local_dir), force_download=True
        )
        context.log.info(f"Successfully downloaded file {filename} from {repo_id}")
        return Path(file_path)
    except Exception as e:
        raise ValueError(f"Failed to download file {filename} from {repo_id}: {e}")


@dg.asset(group_name="dataset_import", compute_kind="python")
def dataset_download(context: dg.AssetExecutionContext, config: DatasetImportConfig) -> str:
    """
    Downloads a dataset from the Hugging Face Hub using the specified method.

    Args:
        context: Dagster execution context
        config: Configuration specifying how to download the dataset

    Returns:
        str: Path to the downloaded dataset
    """
    local_dir = Path(config.local_dir)
    local_dir.mkdir(parents=True, exist_ok=True)

    context.log.info(f"Downloading dataset {config.repo_id} to {local_dir}")

    if config.use_git_lfs:
        _clone_with_git_lfs(config.repo_id, local_dir, context, fresh_clone=config.fresh_clone)
    elif config.use_datasets_library:
        _download_with_datasets(config.repo_id, local_dir, context)
    elif config.filename:
        _download_file(config.repo_id, config.filename, local_dir, context)
    else:
        raise ValueError("Must specify one of: use_git_lfs=True, use_datasets_library=True, or filename")

    return str(local_dir)


@dg.asset(group_name="dataset_import", compute_kind="python", deps=[dataset_download])
def dataset_parse(context: dg.AssetExecutionContext, dataset_download: str, config: DatasetParseConfig) -> None:
    """
    Parses the downloaded dataset and saves it to the specified output directory.

    For Git LFS downloaded repositories, this will:
    1. Read the dataset structure
    2. Parse any metadata files
    3. Create a standardized format in the output directory

    Args:
        context: Dagster execution context
        dataset_download: Path to the downloaded dataset
        config: Configuration for parsing the dataset
    """
    input_dir = Path(dataset_download)
    output_dir = Path(config.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    context.log.info(f"Parsing dataset from {input_dir} to {output_dir}")

    # Read dataset structure
    if not input_dir.is_dir():
        raise ValueError(f"Dataset path {input_dir} is not a directory")

    # List all files in the repository
    files = list(input_dir.rglob("*"))
    context.log.info(f"Found {len(files)} files in dataset")

    # Basic structure analysis
    data_files = [f for f in files if f.is_file()]
    for file in data_files:
        rel_path = file.relative_to(input_dir)
        context.log.debug(f"Found file: {rel_path}")

    # For now, just create a simple manifest
    manifest = {
        "dataset_path": str(input_dir),
        "file_count": len(data_files),
        "files": [str(f.relative_to(input_dir)) for f in data_files],
    }

    # Write manifest
    manifest_file = output_dir / "dataset_manifest.json"
    with open(manifest_file, "w") as f:
        json.dump(manifest, f, indent=2)

    context.log.info(f"Created dataset manifest at {manifest_file}")


def _extract_urls(urls_data: Any) -> List[str]:
    """
    Extract URLs from various data types (numpy array, list, str).

    Args:
        urls_data: URLs in various formats

    Returns:
        List[str]: List of valid URLs
    """
    if isinstance(urls_data, (list, str)):
        urls = [urls_data] if isinstance(urls_data, str) else urls_data
    else:
        # Handle numpy arrays and other sequence types
        try:
            urls = urls_data.tolist() if hasattr(urls_data, "tolist") else list(urls_data)
        except Exception:
            return []

    # Filter and clean URLs
    return [str(url) for url in urls if url]


def _download_url(url: str, output_path: Path, context: dg.AssetExecutionContext) -> bool:
    """
    Downloads a file from a URL to the specified path.

    Args:
        url: URL to download from
        output_path: Path to save the downloaded file
        context: Dagster execution context for logging

    Returns:
        bool: True if download was successful, False otherwise
    """
    try:
        # Add delay for rate limiting
        time.sleep(0.3)  # 1 request per second max

        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        context.log.warning(f"Failed to download {url}: {e}")
        return False


@dg.asset(
    group_name="dataset_import",
    compute_kind="python",
    deps=[dataset_download],
)
def dataset_download_urls(
    context: dg.AssetExecutionContext,
    dataset_download: str,
    config: DatasetParquetUrlDownloadConfig,
) -> None:
    """
    Downloads files from URLs found in parquet datasets.

    Args:
        context: Dagster execution context
        dataset_download: Path to the downloaded dataset
        config: Configuration for URL downloading
    """
    input_dir = Path(dataset_download) / config.parquet_dir
    if not input_dir.exists():
        raise ValueError(f"Parquet directory not found at {input_dir}")

    # Find all parquet files
    parquet_files = list(input_dir.glob("*.parquet"))
    if not parquet_files:
        raise ValueError(f"No parquet files found in {input_dir}")

    context.log.info(f"Found {len(parquet_files)} parquet files")

    # Create output directory
    output_dir = Path(config.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Track progress
    successful_downloads = 0
    failed_downloads = 0
    total_urls = 0

    # Process each parquet file
    for parquet_file in parquet_files:
        context.log.info(f"Processing {parquet_file}")
        df = pd.read_parquet(parquet_file)

        context.log.info(f"Loaded parquet file with {len(df)} rows")
        context.log.info(f"Columns: {df.columns.tolist()}")

        if config.url_column not in df.columns:
            raise ValueError(
                f"URL column '{config.url_column}' not found in {parquet_file}. "
                f"Available columns: {df.columns.tolist()}"
            )

        # Process each row
        with ThreadPoolExecutor(max_workers=config.max_workers) as executor:
            future_to_url = {}

            for idx, row in df.iterrows():
                if idx % 1000 == 0:
                    context.log.info(f"Processing row {idx}")

                # Extract URLs using helper function
                urls = _extract_urls(row[config.url_column])
                if not urls:
                    context.log.debug(f"Skipping row {idx}: no valid URLs")
                    continue

                # Use row ID as base filename
                base_filename = row["id"]
                if not base_filename:
                    context.log.warning(f"Skipping row {idx}: no ID")
                    continue

                for i, url in enumerate(urls):
                    # Generate unique filename for each URL
                    filename = f"{base_filename}_{i}.{config.default_extension}"
                    output_path = output_dir / filename

                    # Skip if file exists and no overwrite
                    if output_path.exists() and not config.overwrite_existing:
                        context.log.debug(f"Skipping existing file: {output_path}")
                        continue

                    # Limit batch size for rate limiting
                    if len(future_to_url) >= config.max_workers * 2:
                        # Wait for some downloads to complete before adding more
                        successful_downloads, failed_downloads = _process_completed_downloads(
                            future_to_url, context, successful_downloads, failed_downloads
                        )
                        future_to_url = {}

                    # Submit download task
                    future = executor.submit(_download_url, url, output_path, context)
                    future_to_url[future] = (url, output_path)
                    total_urls += 1

            # Process remaining downloads
            if future_to_url:
                successful_downloads, failed_downloads = _process_completed_downloads(
                    future_to_url, context, successful_downloads, failed_downloads
                )

    # Log summary
    context.log.info(
        f"Download complete. Successful: {successful_downloads}, Failed: {failed_downloads}, Total: {total_urls}"
    )


def _process_completed_downloads(
    future_to_url: dict,
    context: dg.AssetExecutionContext,
    successful_downloads: int,
    failed_downloads: int,
) -> tuple[int, int]:
    """Process completed downloads and update counters."""
    with tqdm(total=len(future_to_url), desc="Downloading files") as pbar:
        for future in as_completed(future_to_url):
            url, output_path = future_to_url[future]
            try:
                success = future.result()
                if success:
                    successful_downloads += 1
                    context.log.debug(f"Successfully downloaded {url} to {output_path}")
                else:
                    failed_downloads += 1
                    context.log.warning(f"Failed to download {url}")
            except Exception as e:
                context.log.error(f"Error downloading {url}: {e}")
                failed_downloads += 1
            pbar.update(1)

    return successful_downloads, failed_downloads
