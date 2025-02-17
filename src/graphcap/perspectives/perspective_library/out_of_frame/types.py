# SPDX-License-Identifier: Apache-2.0
"""
Out-of-Frame Caption Types

Type definitions for the Out-of-Frame caption perspective.
"""

from typing import TypedDict
from pydantic import BaseModel, Field

from ..base import PerspectiveData

class OutOfFrameCaptionData(PerspectiveData):
    """
    Schema for Out-of-Frame caption responses.

    Attributes:
        visible_description: Factual description of the visible elements in the image.
        imagined_context: Creative speculation on hidden or extended details beyond the visible frame.
        out_of_frame_caption: Final creative caption that combines visible details and imaginative context.
    """
    visible_description: str = Field(
        description="Factual description of the visible elements in the image."
    )
    imagined_context: str = Field(
        description="Creative speculation on hidden or extended details beyond the visible frame."
    )
    out_of_frame_caption: str = Field(
        description="Final creative caption that combines visible details and imaginative context."
    )

class ParsedData(TypedDict):
    visible_description: str
    imagined_context: str
    out_of_frame_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData
