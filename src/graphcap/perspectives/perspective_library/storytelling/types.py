# SPDX-License-Identifier: Apache-2.0
"""
Storytelling Caption Types

Type definitions for the storytelling caption perspective.
"""

from typing import TypedDict
from pydantic import BaseModel, Field

from ..base import PerspectiveData

class StorytellingCaptionData(PerspectiveData):
    """Schema for structured storytelling caption response.

    Attributes:
        scene_setting: Brief description of the scene setting (background/environment).
        character_elements: Details about characters or key objects present.
        plot_build: Narrative elements that build up the storyline.
        climax: A pivotal moment or conflict in the narrative.
        storytelling_caption: A cohesive narrative that ties all elements together into a captivating story.
    """
    scene_setting: str = Field(description="Brief description of the scene setting (background/environment)")
    character_elements: str = Field(description="Details about characters or key objects present in the image")
    plot_build: str = Field(description="Elements that build up the narrative and suggest a sequence of events")
    climax: str = Field(description="A pivotal moment or conflict in the narrative")
    storytelling_caption: str = Field(description="A cohesive narrative that ties all elements together into a captivating story")

class ParsedData(TypedDict):
    """Type definition for parsed storytelling caption data.

    Attributes:
        scene_setting: Narrative description of the setting.
        character_elements: Description of characters or key objects.
        plot_build: Narrative progression elements.
        climax: The pivotal narrative moment.
        storytelling_caption: Final comprehensive storytelling caption.
    """
    scene_setting: str
    character_elements: str
    plot_build: str
    climax: str
    storytelling_caption: str

class CaptionData(TypedDict):
    """Type definition for storytelling caption data container.

    Attributes:
        filename: Path to the image file.
        input_path: Path to the input file.
        parsed: Dictionary containing parsed storytelling caption data.
    """
    filename: str
    input_path: str
    parsed: ParsedData
