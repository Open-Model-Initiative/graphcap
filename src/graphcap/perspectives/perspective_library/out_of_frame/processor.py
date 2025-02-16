# SPDX-License-Identifier: Apache-2.0
"""
Out-of-Frame Caption Processor

Implements a creative image analysis that first describes visible elements,
then speculates on hidden or extended details beyond the image frame,
producing an imaginative, freeform caption.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import OutOfFrameCaptionData, ParsedData

# Instruction prompt for generating Out-of-Frame captions.
instruction = """<Task>You are an imaginative image analysis agent. Generate a creative caption that first describes what is visible in the image and then speculates about what might lie beyond the frame.</Task>
<VisibleDescription note="Describe the factual elements observed in the image.">
<ImaginedContext note="Speculate on unseen details or extend the narrative with creative hallucinations.">
<OutOfFrameCaption note="Combine both descriptions into a freeform, imaginative caption that goes beyond the visible frame.">
"""

class OutOfFrameProcessor(BasePerspective):
    """
    Processor for generating Out-of-Frame captions.

    This processor produces captions that not only describe the visible elements of an image
    but also creatively speculate on what might exist beyond the frame.
    """

    def __init__(self) -> None:
        super().__init__(
            config_name="out_of_frame",
            version="1",
            prompt=instruction,
            schema=OutOfFrameCaptionData,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ParsedData]) -> Table:
        """Create a Rich table for displaying Out-of-Frame caption data."""
        result = caption_data["parsed"]

        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Element", style="cyan")
        table.add_column("Content", style="green")

        table.add_row("Visible Description", result["visible_description"])
        table.add_row("Imagined Context", result["imagined_context"])
        table.add_row("Out-of-Frame Caption", result["out_of_frame_caption"])

        logger.info(f"Generated out-of-frame caption for {caption_data['filename']}: {result['out_of_frame_caption']}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write the Out-of-Frame caption outputs to the job directory."""
        result = caption_data["parsed"]

        response_file = job_dir / "out_of_frame_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "visible_description": result["visible_description"],
                        "imagined_context": result["imagined_context"],
                        "out_of_frame_caption": result["out_of_frame_caption"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")  # Separate entries by newline

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Out-of-Frame caption data to a flat dictionary."""
        result = caption_data.get("parsed", {})
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}

        return {
            "filename": caption_data.get("filename", "unknown"),
            "visible_description": result.get("visible_description", ""),
            "imagined_context": result.get("imagined_context", ""),
            "out_of_frame_caption": result.get("out_of_frame_caption", ""),
        }

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        """Convert Out-of-Frame caption data to a context string."""
        result = caption_data.get("parsed", {})
        context_block = "<OutOfFrameCaption>\n"
        context_block += f"{result.get('out_of_frame_caption', '')}\n"
        context_block += "</OutOfFrameCaption>\n"
        return context_block
