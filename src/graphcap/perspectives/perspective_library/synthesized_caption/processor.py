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
<Task>You are a structured image analysis agent. Generate comprehensive tag list, caption,
and dense caption for an image classification system.</Task>

<TagCategories requirement="You should generate a minimum of 1 tag for each category." confidence="Confidence score
for the tag, between 0 (exclusive) and 1 (inclusive).">
- Entity: The content of the image, including the objects, people, and other elements
- Relationship: The relationships between the entities in the image
- Style: The style of the image, including the color, lighting, and other stylistic elements
- Attribute: The most important attributes of the entities and relationships
- Composition: The composition of the image, including the arrangement of elements
- Contextual: The contextual elements including background and foreground
- Technical: The technical elements including camera angle and lighting
- Semantic: The semantic elements including meaning and symbols

<Examples note="These show the expected format as an abstraction.">
{
  "tags_list": [
    {
      "tag": "subject 1",
      "category": "Entity",
      "confidence": 0.98
    },
    {
      "tag": "subject 2",
      "category": "Entity",
      "confidence": 0.95
    },
    {
      "tag": "subject 1 runs from subject 2",
      "category": "Relationship",
      "confidence": 0.90
    }
  ]
}
</Examples>
</TagCategories>
<ShortCaption note="The short caption is a concise single sentence caption of the image content
with a maximum length of 100 characters.">
<Verification note="The verification identifies issues with the extracted tags and simple caption where the tags
do not match the visual content you can actually see. Be a critic.">
<DenseCaption note="The dense caption is a descriptive but grounded narrative paragraph of the image content.
Only reference items you are confident you can see in the image.It uses straightforward confident and clear language
without overt flowery prose. It incorporates elements from each of the tag categories to provide a broad dense caption">
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
        
        # Add columns for all major components
        table.add_column("Short Caption", style="cyan")
        table.add_column("Dense Caption", style="blue")
        table.add_column("Verification", style="yellow")
        table.add_column("Composite Analysis", style="magenta")
        table.add_column("Final Caption", style="green")

        # Add the main row with all caption components
        table.add_row(
            result["short_caption"],
            result["dense_caption"],
            result["verification"],
            result["composite_analysis"],
            result["final_caption"]
        )

        # Add a separate table for tags
        tags_table = Table(show_header=True, header_style="bold cyan", title="Tags")
        tags_table.add_column("Category", style="cyan")
        tags_table.add_column("Tag", style="white")
        tags_table.add_column("Confidence", style="green")

        for tag in result["tags_list"]:
            tags_table.add_row(
                tag["category"],
                tag["tag"],
                f"{tag['confidence']:.2f}"
            )

        table.add_row(tags_table)
        
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
                        "tags_list": result["tags_list"],
                        "short_caption": result["short_caption"],
                        "verification": result["verification"],
                        "dense_caption": result["dense_caption"],
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
            "short_caption": result.get("short_caption", ""),
            "verification": result.get("verification", ""),
            "dense_caption": result.get("dense_caption", ""),
            "composite_analysis": result.get("composite_analysis", ""),
            "final_caption": result.get("final_caption", ""),
            "num_tags": len(result.get("tags_list", [])),
        }

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        """Convert synthesized caption data to a context string."""
        result = caption_data.get("parsed", {})
        context_block = "<SynthesizedCaption>\n"
        
        # Add tags section
        context_block += "<Tags>\n"
        for tag in result.get("tags_list", []):
            context_block += f"{tag['category']}: {tag['tag']} ({tag['confidence']:.2f})\n"
        context_block += "</Tags>\n"
        
        # Add other caption components
        context_block += f"<ShortCaption>{result.get('short_caption', '')}</ShortCaption>\n"
        context_block += f"<Verification>{result.get('verification', '')}</Verification>\n"
        context_block += f"<DenseCaption>{result.get('dense_caption', '')}</DenseCaption>\n"
        context_block += f"<CompositeAnalysis>{result.get('composite_analysis', '')}</CompositeAnalysis>\n"
        context_block += f"<FinalCaption>{result.get('final_caption', '')}</FinalCaption>\n"
        
        context_block += "</SynthesizedCaption>\n"
        return context_block
