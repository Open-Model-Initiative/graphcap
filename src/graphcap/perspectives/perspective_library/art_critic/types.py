"""
# SPDX-License-Identifier: Apache-2.0
Art Critic Types

Type definitions for art critic analysis following formal analysis principles.
"""

from typing import TypedDict

from pydantic import Field

from ..base import PerspectiveData


class ArtCriticResult(TypedDict):
    """Type definition for parsed art critic results."""

    visual_elements: list[str]
    technical_elements: list[str]
    style_elements: list[str]
    formal_tags: list[str]
    formal_analysis: str


class CaptionDict(TypedDict):
    """Type definition for full caption dictionary."""

    filename: str
    parsed: ArtCriticResult
    input_path: str


class CaptionData(TypedDict):
    """Type definition for processed caption data for templates."""

    image_path: str
    visual_elements: list[str]
    technical_elements: list[str]
    style_elements: list[str]
    formal_tags: list[str]
    formal_analysis: str


class ArtCriticSchema(PerspectiveData):
    """Schema for art critic analysis response following formal analysis principles."""

    visual_elements: list[str] = Field(
        description="Concrete visual elements present in the image (colors, shapes, lines, etc.)"
    )

    technical_elements: list[str] = Field(
        description="Observable technical aspects (lighting, perspective, composition, etc.)"
    )
    style_elements: list[str] = Field(description="Identifiable style characteristics and artistic techniques")
    formal_tags: list[str] = Field(description="Objective descriptive tags based on formal analysis")
    formal_analysis: str = Field(description="Concrete analysis connecting visual elements to artistic principles")
