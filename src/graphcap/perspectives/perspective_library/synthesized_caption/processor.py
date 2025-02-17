# SPDX-License-Identifier: Apache-2.0
"""
Synthesized Caption Processor

Integrates outputs from multiple captioning perspectives along with the image content to produce a final,
coherent caption that encapsulates all insights.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import SynthesizedCaptionData, ParsedData

# Instruction prompt for generating the synthesized final caption.
instruction = """<Task>You are a synthesis agent that integrates multiple image caption outputs and the original image.</Task>
<CompositeAnalysis note="Combine insights from various captioning perspectives (factual, imaginative, poetic, emotional, etc.).
Verify the images content is consistent with the context and identify hallucinations.">
<FinalCaption note="Generate a final, coherent caption that encapsulates all insights into a single, engaging grounded visual description.">
"""

class SynthesizedCaptionProcessor(BasePerspective):
    """
    Processor for generating a synthesized final caption.

    This processor takes the outputs from various captioning perspectives and the image content,
    and synthesizes them into a final caption that is coherent and comprehensive.
    """

    def __init__(self) -> None:
        super().__init__(
            config_name="synthesized_caption",
            version="1",
            prompt=instruction,
            schema=SynthesizedCaptionData,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ParsedData]) -> Table:
        """Create a Rich table for displaying the synthesized caption data."""
        result = caption_data["parsed"]

        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Composite Analysis", style="cyan")
        table.add_column("Final Caption", style="green")

        table.add_row(result["composite_analysis"], result["final_caption"])
        logger.info(f"Synthesized caption for {caption_data['filename']}: {result['final_caption']}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write the synthesized caption outputs to the job directory."""
        result = caption_data["parsed"]

        response_file = job_dir / "synthesized_caption_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "composite_analysis": result["composite_analysis"],
                        "final_caption": result["final_caption"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert synthesized caption data to a flat dictionary."""
        result = caption_data.get("parsed", {})
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}

        return {
            "filename": caption_data.get("filename", "unknown"),
            "composite_analysis": result.get("composite_analysis", ""),
            "final_caption": result.get("final_caption", ""),
        }

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        """Convert synthesized caption data to a context string."""
        result = caption_data.get("parsed", {})
        context_block = "<SynthesizedCaption>\n"
        context_block += f"{result.get('composite_analysis', '')}\n"
        context_block += f"{result.get('final_caption', '')}\n"
        context_block += "</SynthesizedCaption>\n"
        return context_block
