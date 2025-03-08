"""
# SPDX-License-Identifier: Apache-2.0
Caption Perspectives Module

Collection of different perspectives for analyzing and captioning images.
Each perspective provides a unique way of understanding and describing visual content.

Perspectives:
    GraphCaption: Structured analysis with categorized tags and descriptions.
    ArtCritic: Artistic analysis focusing on composition, technique, and aesthetic qualities.
    CustomCaption: Flexible image analysis based on custom instructions.
    OutOfFrame: Creative analysis speculating on hidden details beyond the image frame.
    PoeticMetaphor: Artistic captioning using figurative language and rich imagery.
    Storytelling: Narrative analysis building a story from scene setting to climax.
    EmotionalSentiment: Captioning focused on the emotional tone conveyed by the image.
"""

from .art_critic import ArtCriticProcessor
from .custom_caption import CustomCaptionProcessor
from .emotional_sentiment import EmotionalSentimentProcessor
from .graph import GraphCaptionProcessor
from .out_of_frame import OutOfFrameProcessor
from .poetic_metaphor import PoeticMetaphorProcessor
from .storytelling import StorytellingCaptionProcessor
from .synthesized_caption import SynthesizedCaptionProcessor
from .temporarium import TemporariumCaptionProcessor
def get_perspective(perspective_name: str, **kwargs):
    if perspective_name == "graph_caption":
        return GraphCaptionProcessor(**kwargs)
    elif perspective_name == "art_critic":
        return ArtCriticProcessor(**kwargs)
    elif perspective_name == "custom_caption":
        return CustomCaptionProcessor(**kwargs)
    elif perspective_name == "out_of_frame":
        return OutOfFrameProcessor(**kwargs)
    elif perspective_name == "poetic_metaphor":
        return PoeticMetaphorProcessor(**kwargs)
    elif perspective_name == "storytelling":
        return StorytellingCaptionProcessor(**kwargs)
    elif perspective_name == "emotional_sentiment":
        return EmotionalSentimentProcessor(**kwargs)
    elif perspective_name == "synthesized_caption":
        return SynthesizedCaptionProcessor(**kwargs)
    elif perspective_name == "temporarium":
        return TemporariumCaptionProcessor(**kwargs)
    else:
        raise ValueError(f"Unknown perspective: {perspective_name}")

def get_perspective_list():
    return [
        "graph_caption",
        "art_critic",
        "out_of_frame",
        "poetic_metaphor",
        "storytelling",
        "emotional_sentiment",
        "temporarium",
    ]

def get_synthesizer() -> SynthesizedCaptionProcessor:
    return SynthesizedCaptionProcessor()

__all__ = [
    "GraphCaptionProcessor",
    "ArtCriticProcessor",
    "CustomCaptionProcessor",
    "StorytellingCaptionProcessor",
    "OutOfFrameProcessor",
    "PoeticMetaphorProcessor",
    "EmotionalSentimentProcessor",
    "TemporariumCaptionProcessor",
    "get_perspective",
    "get_perspective_list",
    "get_synthesizer",
    "SynthesizedCaptionProcessor",
]
