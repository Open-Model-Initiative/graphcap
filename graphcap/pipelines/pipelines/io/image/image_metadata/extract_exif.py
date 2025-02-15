# image_metadata/assets.py

import hashlib
import json
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, TypedDict

import pandas as pd
from dagster import AssetExecutionContext, asset

# image_metadata/ops/extract_exif.py
from PIL import Image

from ..types import DatasetIOConfig


class ImageMetadata(TypedDict):
    """Standard metadata for an image file."""

    file_path: str
    file_name: str
    file_size: int
    file_format: str
    width: int
    height: int
    aspect_ratio: float
    color_mode: str
    bit_depth: int
    file_hash: str
    created_time: str
    modified_time: str
    accessed_time: str


def calculate_file_hash(file_path: str, chunk_size: int = 8192) -> str:
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


def extract_standard_metadata(context: AssetExecutionContext, image_path: str) -> ImageMetadata:
    """
    Extract standard metadata from an image file.

    Args:
        context: Dagster context for logging
        image_path: Path to the image file

    Returns:
        ImageMetadata: Dictionary containing standard image metadata
    """
    context.log.info(f"Extracting standard metadata from: {image_path}")

    try:
        # Get file system metadata
        stat = os.stat(image_path)
        file_name = os.path.basename(image_path)

        # Open image and get basic properties
        with Image.open(image_path) as img:
            width, height = img.size
            format_name = img.format or "Unknown"
            mode = img.mode

            # Calculate bit depth based on mode
            mode_to_bits = {
                "1": 1,  # binary
                "L": 8,  # grayscale
                "P": 8,  # palette
                "RGB": 24,
                "RGBA": 32,
            }
            bit_depth = mode_to_bits.get(mode, 0)

            # Calculate aspect ratio
            aspect_ratio = width / height if height != 0 else 0

        # Calculate file hash
        file_hash = calculate_file_hash(image_path)

        metadata: ImageMetadata = {
            "file_path": image_path,
            "file_name": file_name,
            "file_size": stat.st_size,
            "file_format": format_name,
            "width": width,
            "height": height,
            "aspect_ratio": round(aspect_ratio, 4),
            "color_mode": mode,
            "bit_depth": bit_depth,
            "file_hash": file_hash,
            "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "accessed_time": datetime.fromtimestamp(stat.st_atime).isoformat(),
        }

        return metadata

    except Exception as e:
        context.log.error(f"Error extracting metadata from {image_path}: {e}")
        # Return empty metadata with file path
        return ImageMetadata(
            file_path=image_path,
            file_name=os.path.basename(image_path),
            file_size=0,
            file_format="Unknown",
            width=0,
            height=0,
            aspect_ratio=0.0,
            color_mode="Unknown",
            bit_depth=0,
            file_hash="",
            created_time="",
            modified_time="",
            accessed_time="",
        )


@asset(
    group_name="image_metadata",
    compute_kind="python",
    description="Extracts standard metadata from images and stores it in a Parquet file.",
)
def image_standard_metadata(
    context: AssetExecutionContext,
    image_list: list[str],
    image_dataset_config: DatasetIOConfig,
) -> None:
    """
    Extract standard metadata from a list of images and store it in a Parquet file.

    Args:
        context: Dagster context for logging
        image_list: List of image paths
        image_dataset_config: Dataset configuration
    """
    context.log.info("Extracting standard metadata from image list")

    all_metadata = []
    for image_path in image_list:
        metadata = extract_standard_metadata(context, image_path)
        all_metadata.append(metadata)

    df = pd.DataFrame(all_metadata)
    output_path = f"{image_dataset_config.output_dir}/image_standard_metadata.parquet"
    df.to_parquet(output_path)
    context.log.info(f"Standard metadata saved to: {output_path}")


def run_exiftool(image_path: str) -> dict[str, Any]:
    """
    Run ExifTool on an image and return the metadata as a dictionary.

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary containing all metadata extracted by ExifTool
    """
    try:
        # Run exiftool with JSON output
        result = subprocess.run(
            ["exiftool", "-j", "-n", image_path],
            capture_output=True,
            text=True,
            check=True,
        )

        # Parse JSON output (exiftool returns a list with one item)
        metadata = json.loads(result.stdout)[0]
        return metadata

    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ExifTool failed on {image_path}: {e.stderr}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse ExifTool output for {image_path}: {e}")


@asset(
    group_name="image_metadata",
    compute_kind="python",
    description="Extracts comprehensive metadata using ExifTool and stores it in a Parquet and JSON file.",
)
def image_list_exif_data(
    context: AssetExecutionContext,
    image_list: list[str],
    image_dataset_config: DatasetIOConfig,
) -> str:
    """
    Extract comprehensive metadata from images using ExifTool.

    Args:
        context: Dagster context for logging
        image_list: List of image paths
        image_dataset_config: Dataset configuration

    Returns:
        Path to the Parquet file containing Exif metadata
    """
    context.log.info("Extracting ExifTool metadata from image list")

    all_metadata = []
    for image_path in image_list:
        try:
            metadata = run_exiftool(image_path)
            all_metadata.append(metadata)
            context.log.debug(f"Successfully extracted metadata from {image_path}")
        except Exception as e:
            context.log.error(f"Failed to extract metadata from {image_path}: {e}")
            # Add empty metadata to maintain alignment with image list
            all_metadata.append({"SourceFile": image_path, "Error": str(e)})

    # Convert to DataFrame and save
    df = pd.DataFrame(all_metadata)
    metadata_dir = Path(image_dataset_config.output_dir) / "metadata"
    metadata_dir.mkdir(parents=True, exist_ok=True)  # Ensure the directory exists
    output_path = metadata_dir / "image_exif_metadata.parquet"
    df.to_parquet(output_path)
    json_output_path = metadata_dir / "image_exif_metadata.json"
    df.to_json(json_output_path, orient="records", lines=True)
    context.log.info(f"ExifTool metadata saved to: {output_path}")
    context.log.info(f"ExifTool metadata also saved to: {json_output_path}")

    return str(output_path)
