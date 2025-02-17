# SPDX-License-Identifier: Apache-2.0
"""
Emotional & Sentiment-Based Caption Perspective

Provides captions that focus on the emotional tone of an image, emphasizing mood and sentiment
through evocative, descriptive language.
"""

from .processor import EmotionalSentimentProcessor
from .types import EmotionalSentimentCaptionData

__all__ = ["EmotionalSentimentProcessor", "EmotionalSentimentCaptionData"]
