# SPDX-License-Identifier: Apache-2.0
"""
Emotional & Sentiment-Based Caption Types

Type definitions for the emotional & sentiment-based caption perspective.
"""

from typing import TypedDict

from pydantic import Field

from ..base import PerspectiveData


class EmotionalSentimentCaptionData(PerspectiveData):
    """
    Schema for emotional and sentiment-based caption responses.

    Attributes:
        emotion_analysis: Analysis of the emotional tone conveyed by the image.
        sentiment_caption: A caption that reflects the image's mood using expressive language.
    """
    emotion_analysis: str = Field(
        description="Analysis of the emotional tone conveyed by the image (e.g., joyful, somber, melancholic)."
    )
    sentiment_caption: str = Field(
        description="A caption that reflects the image's mood using descriptive, sentiment-laden language."
    )

class ParsedData(TypedDict):
    emotion_analysis: str
    sentiment_caption: str

class CaptionData(TypedDict):
    filename: str
    input_path: str
    parsed: ParsedData
