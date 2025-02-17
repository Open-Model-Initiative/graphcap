# SPDX-License-Identifier: Apache-2.0
"""
Synthesized Caption Types

Type definitions for the synthesized caption perspective.
"""

from typing import List, TypedDict
from pydantic import BaseModel, Field

from ..base import PerspectiveData

class Tag(BaseModel):
    """Schema for individual tags."""
    tag: str = Field(description="The tag text")
    category: str = Field(description="The category of the tag")
    confidence: float = Field(description="Confidence score between 0 and 1", gt=0, le=1)

class SynthesizedCaptionData(PerspectiveData):
    """
    Schema for synthesized caption responses.

    Attributes:
        tags_list: List of categorized tags with confidence scores
        short_caption: A concise single-sentence caption (max 100 chars)
        verification: Analysis of potential issues with tags and caption
        dense_caption: A detailed narrative paragraph incorporating all tag categories
        composite_analysis: A synthesis of various captioning perspectives
        final_caption: The final coherent caption incorporating all insights
    """
    tags_list: List[Tag] = Field(
        description="List of categorized tags with confidence scores"
    )
    short_caption: str = Field(
        description="A concise single-sentence caption (max 100 chars)"
    )
    verification: str = Field(
        description="Analysis of potential issues with tags and caption"
    )
    dense_caption: str = Field(
        description="A detailed narrative paragraph incorporating all tag categories"
    )
    composite_analysis: str = Field(
        description="A synthesis of outputs from various captioning perspectives"
    )
    final_caption: str = Field(
        description="A final, coherent caption incorporating all insights"
    )

class ParsedData(TypedDict):
    tags_list: List[Tag]
    short_caption: str
    verification: str
    dense_caption: str
    composite_analysis: str
    final_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData
