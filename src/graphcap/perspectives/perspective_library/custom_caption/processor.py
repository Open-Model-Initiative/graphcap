"""
# SPDX-License-Identifier: Apache-2.0
Custom Caption Processor

Implements structured analysis of images with custom instructions.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import CustomCaptionDefinition, CustomCaptionSchema


class CustomCaptionProcessor(BasePerspective):
    """
    Processor for generating custom captions.

    Provides flexible image analysis based on custom instructions.
    """

    def __init__(self, caption_def: CustomCaptionDefinition) -> None:
        """Initialize the custom caption processor.
        
        Args:
            caption_def: Definition containing instruction and name for the custom caption
        """
        super().__init__(
            config_name=f"custom_caption_{caption_def['name']}",
            version="0",
            prompt=caption_def['instruction'],
            schema=CustomCaptionSchema,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, Any]) -> Table:
        """Create Rich table for custom caption data."""
        result = caption_data["parsed"]

        # Create main table
        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Category", style="cyan")
        table.add_column("Content", style="green")

        # Add content
        table.add_row("Scratchpad", result["scratchpad"])
        table.add_row("Caption", result["caption"])

        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write custom caption outputs to the job directory."""
        result = caption_data["parsed"]

        # Write structured response to JSON file
        response_file = job_dir / f"{self.config_name}_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "scratchpad": result["scratchpad"],
                        "caption": result["caption"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")  # Add newline between entries

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert custom caption data to a flat dictionary."""
        result = caption_data.get("parsed", {})

        # Check for error key and return error message if present
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}

        return {
            "filename": caption_data.get("filename", "unknown"),
            "scratchpad": result.get("scratchpad", ""),
            "caption": result.get("caption", ""),
        }
