# SPDX-License-Identifier: Apache-2.0
"""
Temporarium Caption Types

Defines the data schema and type definitions for the Temporarium perspective.
This perspective is focused on integrating temporal context with narrative and speculative details.
"""

from pydantic import BaseModel, Field
from typing import TypedDict

from ..base import PerspectiveData

class TemporariumCaptionData(PerspectiveData):
    """
    Schema for Temporarium caption responses.

    Attributes:
        epoch_context: Detailed historical or temporal context situating the image in a specific epoch.
        narrative_elements: Key narrative details such as characters, objects, or events defining the scene.
        continuity_elements: Explanation of how the scene connects (or contrasts) with known history or speculative futures.
        temporal_speculation: Imaginative extrapolation regarding the evolution or transformation of scene elements.
        detailed_caption: A comprehensive caption that weaves together all the temporal and narrative elements.
    """
    epoch_context: str = Field(description="Detailed historical or temporal context situating the image in a specific epoch.")
    narrative_elements: str = Field(description="Key narrative details such as characters, technologies, or significant objects present in the scene.")
    continuity_elements: str = Field(description="Description of how the image connects to historical events or speculative futures.")
    temporal_speculation: str = Field(description="Imaginative extrapolation about how elements might evolve or have evolved over time.")
    detailed_caption: str = Field(description="A comprehensive caption integrating temporal context, narrative elements, and speculative detail.")

class ParsedData(TypedDict):
    epoch_context: str
    narrative_elements: str
    continuity_elements: str
    temporal_speculation: str
    detailed_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData