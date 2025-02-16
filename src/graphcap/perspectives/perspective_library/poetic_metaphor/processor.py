# SPDX-License-Identifier: Apache-2.0
"""
Poetic & Metaphorical Caption Processor

Generates poetic captions by first extracting poetic clues (such as mood, color, and symbolic elements)
from the image and then composing a final caption that uses figurative language, rich imagery, and metaphor
to capture the image’s essence.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import PoeticCaptionData, ParsedData

# Instruction prompt for generating poetic and metaphorical captions.
instruction = """<Task>You are an artistic image analysis agent. Generate a poetic and metaphorical caption for the image.</Task>
<PoeticClues note="Identify poetic clues in the image (colors, mood, textures, and other elements that inspire symbolic language).">
<PoeticCaption note="Compose a poetic caption that uses figurative language, rich imagery, and metaphor to evoke emotion and abstract interpretation.">
"""

class PoeticMetaphorProcessor(BasePerspective):
    """
    Processor for generating poetic and metaphorical captions.

    This processor extracts poetic clues from the image and then composes a poetic caption that
    uses metaphorical and symbolic language to capture the image’s essence.
    """

    def __init__(self) -> None:
        super().__init__(
            config_name="poetic_metaphor",
            version="1",
            prompt=instruction,
            schema=PoeticCaptionData,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ParsedData]) -> Table:
        """Create a Rich table for displaying poetic caption data."""
        result = caption_data["parsed"]

        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Poetic Clues", style="cyan")
        table.add_column("Poetic Caption", style="green")

        table.add_row(result["poetic_clues"], result["poetic_caption"])
        logger.info(f"Generated poetic caption for {caption_data['filename']}: {result['poetic_caption']}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write poetic caption outputs to the job directory."""
        result = caption_data["parsed"]

        response_file = job_dir / "poetic_metaphor_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "poetic_clues": result["poetic_clues"],
                        "poetic_caption": result["poetic_caption"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")  # Separate entries by newline

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert poetic caption data to a flat dictionary."""
        result = caption_data.get("parsed", {})
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}

        return {
            "filename": caption_data.get("filename", "unknown"),
            "poetic_clues": result.get("poetic_clues", ""),
            "poetic_caption": result.get("poetic_caption", ""),
        }
