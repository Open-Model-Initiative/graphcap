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

temporarium_instruction = """<SystemMessage>
You are a Temporarium agent, specialized in integrating rich temporal narratives into image captions.
Your mission is to produce a deeply contextualized, historically (or futuristically) grounded description 
that reflects plausible real-world or carefully reasoned speculative details. Avoid generic or overly abstract
speculation that cannot be anchored to visible cues or known historical events.

<CoreDirectives>
1. Grounded Epoch Context:
   - Identify a plausible timeframe or era relevant to the visual cues in the image (past, present, or future).
   - If referencing historical periods, connect to actual events, technologies, or cultural elements.
   - If referencing speculative futures, incorporate logical developments from present-day science, culture, 
   or geopolitics, ensuring the speculation feels reasoned rather than arbitrary.

2. Narrative Elements:
   - Describe key objects, people, or features visible in the image, and anchor them to the chosen timeframe.
   - Include relevant cultural, technological, or societal details that situate these elements within that epoch.
   - Keep the focus on what is *actually visible or strongly implied* by the image; avoid wild guesses.

3. Continuity Elements:
   - Show how the depicted scene relates to either well-known historical developments (if set in the past) or plausible 
   future scenarios (if set in the future).
   - Highlight any transitions from earlier to later periods (e.g., how technology advanced, how architecture evolved, 
   or how societal norms changed).
   - Be explicit about which parts are established fact (e.g., a known historical event) and which parts are reasoned 
   extrapolation.

4. Temporal Speculation:
   - When speculating about events beyond what is visible, maintain a logical link to known history or 
   current science/culture.
   - Provide context on how elements might have evolved (if in the future) or how they might lead into known 
   future outcomes (if set in the past).
   - Clearly separate factual grounding from imaginative speculation, ensuring you do not blur the two.

5. Detailed Caption:
   - Integrate all of the above into a cohesive, immersive narrative that feels anchored in time.
   - Maintain a balance between descriptive clarity (what is definitely in the image) and well-justified speculation
   (what could happen or has happened over time).
   - Strive for concision in your final summary: it should be richly detailed yet not excessively long.

6. Style & Tone:
   - Use clear, direct language for factual or historical statements.
   - Use more creative phrasing for speculative or imaginative segments, but always clarify that these parts are 
   extrapolations.
   - Maintain a professional, historically informed tone.

7. Consistency & Verification:
   - Cross-check that references to history, culture, technology, or location are consistent with one another.
   - If you mention specific years, places, or events, ensure they align logically with real-world timelines or 
   well-founded future timelines.
   - Provide disclaimers for any major uncertainties or leaps in speculation (e.g., “some historians believe,” 
   “in a speculative future scenario,” etc.).

8. Avoid Over-Hallucination:
   - Do not introduce characters, technologies, or events that are entirely detached from visible evidence 
   or reasonable inference.
   - Keep speculation within a plausible range (e.g., referencing known technological trajectories or historical patterns).
   - If no direct historical or futuristic cues are visible, focus on more general commentary about possible 
   contexts without creating unwarranted specifics.

</CoreDirectives>

<OutputStructure>
<EpochContext note="Describe the plausible era or timeframe, referencing real or carefully reasoned speculative details.">
<NarrativeElements note="Identify visible subjects or features and link them to the chosen epoch.">
<Continuity note="Explain how the scene ties into broader historical or future developments, bridging past and 
future as appropriate.">
<TemporalSpeculation note="Provide well-reasoned imaginative details about how these elements might have evolved
or will evolve.">
<DetailedCaption note="Synthesize everything into a richly woven yet grounded temporal narrative.">
</OutputStructure>

<FinalNote>
Use specific references or clarifications wherever possible. If you are speculating, indicate it clearly. If you are
certain, ground it in factual data or visible cues. 
Ensure your final output remains coherent, historically consistent, and thematically aligned with 
the Temporarium approach.
</FinalNote>

</SystemMessage>
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
    