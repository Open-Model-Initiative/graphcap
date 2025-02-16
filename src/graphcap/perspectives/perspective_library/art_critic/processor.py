"""
# SPDX-License-Identifier: Apache-2.0
Art Critic Processor

Provides artistic analysis of images focusing on formal analysis and
concrete visual elements, following ArtCoT methodology for reduced hallucination.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import ArtCriticResult, ArtCriticSchema

instruction = """Analyze this image using formal analysis principles, focusing exclusively on observable elements.
 Avoid adding any subjective commentary or unnecessary filler details. Your response must follow this structured format:

1. Visual Elements: List only the concrete, observable elements present in the image:
   - Colors and their relationships
   - Shapes and forms
   - Lines and textures
   - Space and scale

2. Technical Elements: Document only the directly observable technical aspects:
   - Lighting and shadows
   - Perspective and depth
   - Composition and layout
   - Execution quality

3. Style Elements: Note only identifiable artistic techniques:
   - Brushwork or medium characteristics
   - Stylistic choices
   - Technical approaches
   - Artistic methods

4. Formal Tags: Provide a bullet list of objective, descriptive tags based solely on what is visible.

5. Formal Analysis: In a concise summary of no more than three sentences, connect the above elements to
artistic principles using only concrete, observable language. Do not speculate or include any additional commentary.

Only describe what you can definitively see."""


class ArtCriticProcessor(BasePerspective):
    """
    Processor for generating formal analysis of images.

    Uses ArtCoT methodology to reduce hallucination and improve
    alignment with human aesthetic judgment through concrete
    observation and formal analysis.
    """

    def __init__(self):
        super().__init__(
            config_name="artcap",
            version="1",
            prompt=instruction,
            schema=ArtCriticSchema,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ArtCriticResult]) -> Table:
        """Create Rich table for art critic data."""
        result = caption_data["parsed"]

        # Create main table
        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Category", style="cyan")
        table.add_column("Elements", style="green")

        # Add each analysis section
        table.add_row("Visual Elements", "\n".join(f"• {element}" for element in result["visual_elements"]))
        table.add_row("Technical Elements", "\n".join(f"• {element}" for element in result["technical_elements"]))
        table.add_row("Style Elements", "\n".join(f"• {element}" for element in result["style_elements"]))
        table.add_row("Formal Tags", "\n".join(f"• {tag}" for tag in result["formal_tags"]))
        table.add_row("Formal Analysis", result["formal_analysis"])

        logger.info(f"Art analysis complete for {caption_data['filename']}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write art critic outputs to the job directory."""
        result = caption_data["parsed"]

        # Write structured response to JSON file
        response_file = job_dir / "art_critic_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "visual_elements": result["visual_elements"],
                        "technical_elements": result["technical_elements"],
                        "style_elements": result["style_elements"],
                        "formal_tags": result["formal_tags"],
                        "formal_analysis": result["formal_analysis"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")  # Add newline between entries

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert art critic data to a flat dictionary."""
        result = caption_data.get("parsed", {})  # Use .get() to handle missing "parsed" key

        # Check for error key and return error message if present
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}

        return {
            "filename": caption_data.get("filename", "unknown"),
            "visual_elements": ", ".join(result.get("visual_elements", [])),
            "technical_elements": ", ".join(result.get("technical_elements", [])),
            "style_elements": ", ".join(result.get("style_elements", [])),
            "formal_tags": ", ".join(result.get("formal_tags", [])),
            "formal_analysis": result.get("formal_analysis", ""),
        }

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        """Convert art critic data to a context string."""
        result = caption_data.get("parsed", {})
        context_block = "<ArtCriticAnalysis>\n"
        context_block += f"{result.get('formal_analysis', '')}\n"
        context_block += "</ArtCriticAnalysis>\n"
        return context_block
