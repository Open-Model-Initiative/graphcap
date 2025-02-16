# SPDX-License-Identifier: Apache-2.0
"""
Poetic Caption Types

Type definitions for the poetic & metaphorical caption perspective.
"""

from typing import TypedDict
from pydantic import BaseModel, Field

from ..base import PerspectiveData

class PoeticCaptionData(PerspectiveData):
    """
    Schema for poetic and metaphorical caption responses.

    Attributes:
        poetic_clues: Extracted poetic clues from the image (colors, mood, textures, etc.).
        poetic_caption: A final poetic caption that uses figurative language and rich imagery to capture the essence of the image.
    """
    poetic_clues: str = Field(
        description="Extracted poetic clues from the image (colors, mood, textures, etc.)"
    )
    poetic_caption: str = Field(
        description="Final poetic caption using figurative language and metaphor to capture the image’s essence."
    )

class ParsedData(TypedDict):
    poetic_clues: str
    poetic_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData
