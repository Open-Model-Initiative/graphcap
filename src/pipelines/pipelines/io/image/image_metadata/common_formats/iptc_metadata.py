# SPDX-License-Identifier: Apache-2.0
"""
iptc_metadata module

Provides functionality to extract IPTC metadata from image descriptions.
Extracts fields such as caption, keywords, location data, and credits, and
associates them with the unique identifier of the core image.
"""

import re
from pathlib import Path
from typing import Any, Dict

import pandas as pd
from dagster import AssetExecutionContext, asset

from ...types import DatasetIOConfig  # Adjust relative import as needed


def extract_iptc_metadata(description: str) -> Dict[str, Any]:
    """
    Extract IPTC metadata from the image description.
    Searches for markers like 'IPTCCaption:', 'IPTCKeywords:', 'IPTCLocation:' and 'IPTCCredits:'.

    Args:
        description (str): The image description text.

    Returns:
        Dict[str, Any]: Extracted IPTC metadata.
    """
    result: Dict[str, Any] = {}
    caption_match = re.search(r"IPTCCaption:\s*(.+?)(?:\s|$)", description)
    if caption_match:
        result["caption"] = caption_match.group(1).strip()
    keywords_match = re.search(r"IPTCKeywords:\s*(.+?)(?:\s|$)", description)
    if keywords_match:
        result["keywords"] = keywords_match.group(1).strip()
    location_match = re.search(r"IPTCLocation:\s*(.+?)(?:\s|$)", description)
    if location_match:
        result["location"] = location_match.group(1).strip()
    credits_match = re.search(r"IPTCCredits:\s*(.+?)(?:\s|$)", description)
    if credits_match:
        result["credits"] = credits_match.group(1).strip()
    # Extend with additional IPTC fields as needed.
    return result


@asset(
    group_name="image_metadata",
    compute_kind="python",
    description="Extracts IPTC metadata from image descriptions and stores it in a Parquet and JSON file.",
)
def iptc_metadata(
    context: AssetExecutionContext,
    image_list_exif_data: str,
    image_dataset_config: DatasetIOConfig,
) -> None:
    """
    Extracts IPTC metadata from image descriptions.

    Args:
        context: Dagster execution context for logging.
        image_list_exif_data: Path to the Parquet file containing Exif metadata.
        image_dataset_config: Dataset configuration including output directory.
    """
    context.log.info("Extracting IPTC metadata from image descriptions")

    df_exif = pd.read_parquet(image_list_exif_data)
    iptc_data = []
    for _, row in df_exif.iterrows():
        description = row.get("Description", "")
        source_file = row.get("SourceFile", "")
        metadata = extract_iptc_metadata(description)
        metadata["source_file"] = source_file
        iptc_data.append(metadata)

    iptc_df = pd.DataFrame(iptc_data)
    output_parquet = Path(image_dataset_config.output_dir) / "metadata/iptc_metadata_combined.parquet"
    output_json = Path(image_dataset_config.output_dir) / "metadata/iptc_metadata_combined.json"

    iptc_df.to_parquet(output_parquet)
    iptc_df.to_json(output_json, orient="records", lines=True)

    context.log.info(f"Combined IPTC metadata saved to: {output_parquet}")
    context.log.info(f"Combined IPTC metadata also saved to: {output_json}")
