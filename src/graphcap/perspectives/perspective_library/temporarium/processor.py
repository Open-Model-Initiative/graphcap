# SPDX-License-Identifier: Apache-2.0
"""
Temporarium Caption Processor

Generates captions that integrate detailed temporal context with historical narrative 
and speculative futurism. The processor outputs a richly layered caption that includes:
- Epoch Context: A description of the historical or speculative era.
- Narrative Elements: Key details about characters, objects, or events.
- Continuity Elements: How the scene connects (or contrasts) with known history or future visions.
- Temporal Speculation: Imaginative extrapolation on how the depicted elements might evolve.
- Detailed Caption: A comprehensive, immersive narrative combining all the above.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import TemporariumCaptionData, ParsedData

temporarium_instruction = """<Task>You are a Temporarium agent specialized in generating captions that integrate detailed temporal contexts and imaginative speculation, accurately situating images within specific historical or futuristic epochs.</Task>
<EpochContext note="Describe the specific historical period, event, or speculative era that frames the image.">
<NarrativeElements note="Detail key narrative elements such as characters, technologies, or significant objects that define the scene.">
<Continuity note="Identify connections or contrasts with known historical events or speculative futures, showing continuity or transformation over time.">
<TemporalSpeculation note="Extrapolate imaginative details about how elements in the image might have evolved or might evolve, highlighting temporal dynamics.">
<DetailedCaption note="Combine all elements into a cohesive, richly detailed caption that provides an immersive temporal narrative.">
"""

class TemporariumCaptionProcessor(BasePerspective):
    def __init__(self) -> None:
        super().__init__(
            config_name="temporarium",
            version="1",
            prompt=temporarium_instruction,
            schema=TemporariumCaptionData,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ParsedData]) -> Table:
        result = caption_data["parsed"]
        table = Table(title="Temporarium Caption Analysis", show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Temporal Component", style="cyan")
        table.add_column("Detail", style="green")

        table.add_row("Epoch Context", result.get("epoch_context", ""))
        table.add_row("Narrative Elements", result.get("narrative_elements", ""))
        table.add_row("Continuity Elements", result.get("continuity_elements", ""))
        table.add_row("Temporal Speculation", result.get("temporal_speculation", ""))
        table.add_row("Detailed Caption", result.get("detailed_caption", ""))
        logger.info(f"Temporarium caption generated for {caption_data.get('filename', 'unknown')}: {result.get('detailed_caption', '')}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        result = caption_data["parsed"]
        response_file = job_dir / "temporarium_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "epoch_context": result.get("epoch_context", ""),
                        "narrative_elements": result.get("narrative_elements", ""),
                        "continuity_elements": result.get("continuity_elements", ""),
                        "temporal_speculation": result.get("temporal_speculation", ""),
                        "detailed_caption": result.get("detailed_caption", ""),
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        result = caption_data.get("parsed", {})
        if "error" in result:
            return {"filename": caption_data.get("filename", "unknown"), "error": result["error"]}
        return {
            "filename": caption_data.get("filename", "unknown"),
            "epoch_context": result.get("epoch_context", ""),
            "narrative_elements": result.get("narrative_elements", ""),
            "continuity_elements": result.get("continuity_elements", ""),
            "temporal_speculation": result.get("temporal_speculation", ""),
            "detailed_caption": result.get("detailed_caption", ""),
        }

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        result = caption_data.get("parsed", {})
        context_block = "<TemporariumCaption>\n"
        context_block += f"<EpochContext>{result.get('epoch_context', '')}</EpochContext>\n"
        context_block += f"<NarrativeElements>{result.get('narrative_elements', '')}</NarrativeElements>\n"
        context_block += f"<ContinuityElements>{result.get('continuity_elements', '')}</ContinuityElements>\n"
        context_block += f"<TemporalSpeculation>{result.get('temporal_speculation', '')}</TemporalSpeculation>\n"
        context_block += f"<DetailedCaption>{result.get('detailed_caption', '')}</DetailedCaption>\n"
        context_block += "</TemporariumCaption>\n"
        return context_block
    