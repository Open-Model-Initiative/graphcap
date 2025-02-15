# SPDX-License-Identifier: Apache-2.0
"""
xmp_metadata module

Provides functionality to extract XMP metadata from image descriptions.
Extracts fields such as creator, rights, and keywords, and associates them
with the unique identifier of the core image.
"""

from pathlib import Path
from typing import Any, Dict, Optional, TypedDict

import pandas as pd
from dagster import AssetExecutionContext, asset

from ...types import DatasetIOConfig


class XMPMetadata(TypedDict):
    """
    TypedDict to represent the structure of extracted XMP metadata.
    """

    xmp_toolkit: Optional[str]
    digital_image_guid: Optional[str]
    digital_source_type: Optional[str]


def extract_xmp_metadata(exif_record: Dict[str, Any]) -> XMPMetadata:
    """
    Extract XMP metadata from the image record.

    This function checks the Exif record for XMP-specific metadata.

    Args:
        exif_record (dict): The full exif metadata dictionary.

    Returns:
        XMPMetadata: Extracted XMP metadata.
    """
    result: XMPMetadata = {}
    # Extract specific XMP data items
    if "XMPToolkit" in exif_record:
        result["xmp_toolkit"] = exif_record["XMPToolkit"]
    if "DigitalImageGUID" in exif_record:
        result["digital_image_guid"] = exif_record["DigitalImageGUID"]
    if "DigitalSourceType" in exif_record:
        result["digital_source_type"] = exif_record["DigitalSourceType"]

    return result


@asset(
    group_name="image_metadata",
    compute_kind="python",
    description="Extracts XMP metadata from image descriptions and stores it in a Parquet and JSON file.",
)
def xmp_metadata(
    context: AssetExecutionContext,
    image_list_exif_data: str,
    image_dataset_config: DatasetIOConfig,
) -> None:
    """
    Extracts XMP metadata from image descriptions.

    Args:
        context: Dagster execution context for logging.
        image_list_exif_data: Path to the Parquet file containing Exif metadata.
        image_dataset_config: Dataset configuration including output directory.
    """
    context.log.info("Extracting XMP metadata from image descriptions")

    df_exif = pd.read_parquet(image_list_exif_data)
    xmp_data = []
    for _, row in df_exif.iterrows():
        source_file = row.get("SourceFile", "")
        metadata = extract_xmp_metadata(row.to_dict())  # Pass the entire row as a dictionary
        metadata["source_file"] = source_file
        xmp_data.append(metadata)

    xmp_df = pd.DataFrame(xmp_data)
    output_parquet = Path(image_dataset_config.output_dir) / "metadata/xmp_metadata_combined.parquet"
    output_json = Path(image_dataset_config.output_dir) / "metadata/xmp_metadata_combined.json"

    xmp_df.to_parquet(output_parquet)
    xmp_df.to_json(output_json, orient="records", lines=True)

    context.log.info(f"Combined XMP metadata saved to: {output_parquet}")
    context.log.info(f"Combined XMP metadata also saved to: {output_json}")
