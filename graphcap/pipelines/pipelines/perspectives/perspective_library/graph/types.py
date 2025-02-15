"""
# SPDX-License-Identifier: Apache-2.0
Graph Types

Type definitions for the graph caption perspective.

Classes:
    Tag: Base model for tagged elements
    GraphCaptionData: Schema for graph caption responses
    GraphReportData: Type for graph report generation
"""

from typing import Any, TypedDict

from pydantic import BaseModel, Field

from ..base import PerspectiveData


class Tag(BaseModel):
    """Model for individual tagged elements in the image.

    Attributes:
        tag: Description of the tagged element
        category: Category the tag belongs to
        confidence: Confidence score between 0 and 1
    """

    tag: str = Field(description="Description of the tagged element")
    category: str = Field(description="Category the tag belongs to")
    confidence: float = Field(description="Confidence score between 0 and 1")

    def __getitem__(self, key: str) -> Any:
        """Enable dict-like access to fields."""
        return getattr(self, key)


class GraphCaptionData(PerspectiveData):
    """Schema for structured graph caption response.

    Attributes:
        tags_list: List of categorized tags with confidence scores
        short_caption: Concise single sentence caption
        verification: Verification of tag accuracy
        dense_caption: Detailed narrative description
    """

    tags_list: list[Tag] = Field(description="List of categorized tags with confidence scores")
    short_caption: str = Field(description="Concise single sentence caption (max 100 chars)")
    verification: str = Field(description="Verification of tag accuracy and visual grounding")
    dense_caption: str = Field(description="Detailed narrative description incorporating tagged elements")


# Type alias for tag data that can be either a Tag model or dict
TagType = Tag | dict[str, str | float]


class GraphReportData(TypedDict):
    """Type definition for graph report data.

    Attributes:
        image_path: Path to the image file
        short_caption: Concise caption of the image
        tags_by_category: Tags grouped by their categories
        verification: Verification text
        dense_caption: Detailed caption text
    """

    image_path: str
    short_caption: str
    tags_by_category: dict[str, list[TagType]]
    verification: str
    dense_caption: str


class ParsedData(TypedDict):
    """Type definition for parsed caption data.

    Attributes:
        tags_list: List of tag data
        short_caption: Concise caption text
        verification: Verification text
        dense_caption: Detailed caption text
    """

    tags_list: list[TagType]
    short_caption: str
    verification: str
    dense_caption: str


class CaptionData(TypedDict):
    """Type definition for caption data container.

    Attributes:
        filename: Path to the image file
        input_path: Path to the input file
        parsed: Dictionary containing parsed caption data
    """

    filename: str
    input_path: str
    parsed: ParsedData
