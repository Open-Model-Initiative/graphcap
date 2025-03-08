# SPDX-License-Identifier: Apache-2.0
"""
Temporarium Caption Types with Chain-of-Thought

Defines the data schema and type definitions for the Temporarium perspective.
This schema incorporates explicit chain-of-thought reasoning steps to enhance grounding and coherence.
"""

from pydantic import BaseModel, Field
from typing import TypedDict

from ..base import PerspectiveData

class TemporariumCaptionData(PerspectiveData):
    """
    Schema for Temporarium caption responses with chain-of-thought reasoning.

    Attributes:
        visual_analysis: Observations based solely on visible image details.
        epoch_reasoning: Logical reasoning about the implied historical or futuristic epoch.
        epoch_context: Concise summary of the inferred epoch context.
        narrative_reasoning: Explanation of how key elements relate to the epoch.
        narrative_elements: Factual description of key visible subjects or objects.
        continuity_reasoning: Reasoning about the connection to historical trends or plausible futures.
        continuity_elements: Summary of continuity aspects.
        speculative_reasoning: Step-by-step reasoning behind imaginative extrapolation.
        temporal_speculation: Plausible speculative details derived from reasoning.
        detailed_caption: Final synthesized caption integrating all chain-of-thought steps.
    """
    visual_analysis: str = Field(description="Observations based solely on visible image details.")
    epoch_reasoning: str = Field(description="Logical reasoning about the implied historical or futuristic epoch.")
    epoch_context: str = Field(description="Concise summary of the inferred epoch context.")
    narrative_reasoning: str = Field(description="Explanation of how key elements fit within the epoch context.")
    narrative_elements: str = Field(description="Factual description of key visible subjects or objects, linked to the epoch.")
    continuity_reasoning: str = Field(description="Reasoning on how the scene connects to known historical trends or plausible futures.")
    continuity_elements: str = Field(description="Brief summary of historical or futuristic continuity.")
    speculative_reasoning: str = Field(description="Step-by-step reasoning behind any imaginative extrapolation.")
    temporal_speculation: str = Field(description="Imaginative yet plausible speculative details derived from reasoning.")
    detailed_caption: str = Field(description="Final cohesive caption integrating all chain-of-thought steps.")

class ParsedData(TypedDict):
    visual_analysis: str
    epoch_reasoning: str
    epoch_context: str
    narrative_reasoning: str
    narrative_elements: str
    continuity_reasoning: str
    continuity_elements: str
    speculative_reasoning: str
    temporal_speculation: str
    detailed_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData