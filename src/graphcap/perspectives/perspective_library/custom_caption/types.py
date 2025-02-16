"""
# SPDX-License-Identifier: Apache-2.0
Custom Caption Types

Type definitions for the custom caption perspective.

Classes:
    Tag: Base model for tagged elements
    GraphCaptionData: Schema for graph caption responses
    GraphReportData: Type for graph report generation
"""

from typing import TypedDict

from pydantic import Field

from ..base import PerspectiveData


class CustomCaptionDefinition(TypedDict):
    """Definition for custom caption."""

    instruction: str
    name: str


class CustomCaptionSchema(PerspectiveData):
    """Schema for structured custom caption response.

    Attributes:
        scratchpad: A scratchpad for the caption
        caption: A concise caption of the image content
    """

    scratchpad: str = Field(description="A scratchpad for the caption")
    caption: str = Field(description="A concise caption of the image content")


class CaptionData(TypedDict):
    """Type definition for caption data container.

    Attributes:
        filename: Path to the image file
        input_path: Path to the input file
        parsed: Dictionary containing parsed caption data
    """

    filename: str
    input_path: str
    parsed: CustomCaptionSchema
