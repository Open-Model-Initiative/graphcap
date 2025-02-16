# SPDX-License-Identifier: Apache-2.0
"""
Synthesized Caption Types

Type definitions for the synthesized caption perspective.
"""

from typing import TypedDict
from pydantic import BaseModel, Field

from ..base import PerspectiveData

class SynthesizedCaptionData(PerspectiveData):
    """
    Schema for synthesized caption responses.

    Attributes:
        composite_analysis: A synthesis of outputs from various captioning perspectives (factual, imaginative, poetic, emotional).
        final_caption: A final, coherent caption that encapsulates all insights into a single description.
    """
    composite_analysis: str = Field(
        description="A synthesis of outputs from various captioning perspectives (factual, imaginative, poetic, emotional)."
    )
    final_caption: str = Field(
        description="A final, coherent caption that encapsulates all insights into a single description."
    )

class ParsedData(TypedDict):
    composite_analysis: str
    final_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData
