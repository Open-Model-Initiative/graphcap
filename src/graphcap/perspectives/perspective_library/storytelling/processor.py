# SPDX-License-Identifier: Apache-2.0
"""
Storytelling Caption Processor

Implements structured narrative analysis of images by building up scene setting, character details,
plot progression, and climax, culminating in a comprehensive storytelling caption.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import StorytellingCaptionData, ParsedData

# Instruction prompt for generating storytelling captions.
instruction = """<Task>You are a creative narrative image analysis agent. Provide a structured breakdown of the image, building a narrative from the ground up.</Task>
<SceneSetting note="A brief description of the background and environment of the image.">
<CharacterElements note="Details about characters or key objects in the scene.">
<PlotBuild note="Elements that build the storyline, suggesting a sequence of events or tension.">
<Climax note="A pivotal moment or conflict indicated by the image.">
<StorytellingCaption note="A cohesive narrative that ties all elements together into a captivating story.">
"""

class StorytellingCaptionProcessor(BasePerspective):
    """
    Processor for generating structured storytelling captions.

    Provides a detailed narrative breakdown of images with elements like scene setting, character details,
    plot progression, climax, and culminates in a comprehensive storytelling caption.
    """

    def __init__(self) -> None:
        super().__init__(
            config_name="storycap",
            version="1",
            prompt=instruction,
            schema=StorytellingCaptionData,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ParsedData]) -> Table:
        """Create Rich table for storytelling caption data."""
        result = caption_data["parsed"]

        # Create a table with narrative elements.
        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Element", style="cyan")
        table.add_column("Description", style="green")

        table.add_row("Scene Setting", result["scene_setting"])
        table.add_row("Character Elements", result["character_elements"])
        table.add_row("Plot Build", result["plot_build"])
        table.add_row("Climax", result["climax"])
        table.add_row("Storytelling Caption", result["storytelling_caption"])

        logger.info(f"Storytelling caption generated for {caption_data['filename']}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write storytelling caption outputs to the job directory."""
        result = caption_data["parsed"]

        response_file = job_dir / "storycap_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "scene_setting": result["scene_setting"],
                        "character_elements": result["character_elements"],
                        "plot_build": result["plot_build"],
                        "climax": result["climax"],
                        "storytelling_caption": result["storytelling_caption"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")  # Add newline between entries

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert storytelling caption data to a flat dictionary."""
        result = caption_data.get("parsed", {})
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}

        return {
            "filename": caption_data.get("filename", "unknown"),
            "scene_setting": result.get("scene_setting", ""),
            "character_elements": result.get("character_elements", ""),
            "plot_build": result.get("plot_build", ""),
            "climax": result.get("climax", ""),
            "storytelling_caption": result.get("storytelling_caption", ""),
        }
