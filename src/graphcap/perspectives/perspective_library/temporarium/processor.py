# SPDX-License-Identifier: Apache-2.0
"""
Temporarium Caption Processor with Chain-of-Thought

Generates detailed captions by explicitly breaking down the reasoning process into steps:
- VisualAnalysis: Observations based solely on visible image details.
- EpochReasoning: Logical inferences about the historical or futuristic epoch.
- EpochContext: A concise summary of the inferred epoch.
- NarrativeReasoning: Explanation linking visible elements to the epoch.
- NarrativeElements: Factual description of key subjects or objects.
- ContinuityReasoning: Analysis of how the scene relates to known historical trends or plausible futures.
- ContinuityElements: Summary of continuity aspects.
- SpeculativeReasoning: Step-by-step reasoning for imaginative extrapolation.
- TemporalSpeculation: Plausible speculative details derived from that reasoning.
- DetailedCaption: A final synthesized caption integrating all prior steps.

This processor leverages chain-of-thought reasoning to ensure the final output is well-grounded and coherent.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import TemporariumCaptionData, ParsedData

# Updated instruction with explicit chain-of-thought steps
temporarium_instruction = """<Task>
You are a Temporarium agent. Generate a caption by following these steps:
1. <VisualAnalysis> Describe exactly what is visible in the image.
2. <EpochReasoning> Reason logically about what historical period or future era is implied by the visual cues.
3. <EpochContext> Summarize your inferred epoch context.
4. <NarrativeReasoning> Explain how the visible elements relate to the identified epoch.
5. <NarrativeElements> List the key subjects or objects, clearly linked to the epoch.
6. <ContinuityReasoning> Describe how the scene connects to known historical trends or plausible future developments.
7. <ContinuityElements> Summarize these continuity aspects concisely.
8. <SpeculativeReasoning> Provide step-by-step reasoning for any imaginative extrapolation.
9. <TemporalSpeculation> Describe the speculative evolution of elements based on your reasoning.
10. <DetailedCaption> Synthesize all previous steps into one cohesive, grounded caption.
</Task>
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
        table = Table(
            title="Temporarium Caption Analysis (Chain-of-Thought)",
            show_header=True,
            header_style="bold magenta",
            expand=True
        )
        table.add_column("Step", style="cyan")
        table.add_column("Content", style="green")

        table.add_row("Visual Analysis", result.get("visual_analysis", ""))
        table.add_row("Epoch Reasoning", result.get("epoch_reasoning", ""))
        table.add_row("Epoch Context", result.get("epoch_context", ""))
        table.add_row("Narrative Reasoning", result.get("narrative_reasoning", ""))
        table.add_row("Narrative Elements", result.get("narrative_elements", ""))
        table.add_row("Continuity Reasoning", result.get("continuity_reasoning", ""))
        table.add_row("Continuity Elements", result.get("continuity_elements", ""))
        table.add_row("Speculative Reasoning", result.get("speculative_reasoning", ""))
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
                        "visual_analysis": result.get("visual_analysis", ""),
                        "epoch_reasoning": result.get("epoch_reasoning", ""),
                        "epoch_context": result.get("epoch_context", ""),
                        "narrative_reasoning": result.get("narrative_reasoning", ""),
                        "narrative_elements": result.get("narrative_elements", ""),
                        "continuity_reasoning": result.get("continuity_reasoning", ""),
                        "continuity_elements": result.get("continuity_elements", ""),
                        "speculative_reasoning": result.get("speculative_reasoning", ""),
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
            "visual_analysis": result.get("visual_analysis", ""),
            "epoch_reasoning": result.get("epoch_reasoning", ""),
            "epoch_context": result.get("epoch_context", ""),
            "narrative_reasoning": result.get("narrative_reasoning", ""),
            "narrative_elements": result.get("narrative_elements", ""),
            "continuity_reasoning": result.get("continuity_reasoning", ""),
            "continuity_elements": result.get("continuity_elements", ""),
            "speculative_reasoning": result.get("speculative_reasoning", ""),
            "temporal_speculation": result.get("temporal_speculation", ""),
            "detailed_caption": result.get("detailed_caption", ""),
        }

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        result = caption_data.get("parsed", {})
        context_block = "<TemporariumCaption>\n"
        context_block += f"<VisualAnalysis>{result.get('visual_analysis', '')}</VisualAnalysis>\n"
        context_block += f"<EpochReasoning>{result.get('epoch_reasoning', '')}</EpochReasoning>\n"
        context_block += f"<EpochContext>{result.get('epoch_context', '')}</EpochContext>\n"
        context_block += f"<NarrativeReasoning>{result.get('narrative_reasoning', '')}</NarrativeReasoning>\n"
        context_block += f"<NarrativeElements>{result.get('narrative_elements', '')}</NarrativeElements>\n"
        context_block += f"<ContinuityReasoning>{result.get('continuity_reasoning', '')}</ContinuityReasoning>\n"
        context_block += f"<ContinuityElements>{result.get('continuity_elements', '')}</ContinuityElements>\n"
        context_block += f"<SpeculativeReasoning>{result.get('speculative_reasoning', '')}</SpeculativeReasoning>\n"
        context_block += f"<TemporalSpeculation>{result.get('temporal_speculation', '')}</TemporalSpeculation>\n"
        context_block += f"<DetailedCaption>{result.get('detailed_caption', '')}</DetailedCaption>\n"
        context_block += "</TemporariumCaption>\n"
        return context_block