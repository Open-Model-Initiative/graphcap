"""
# SPDX-License-Identifier: Apache-2.0
Caption Perspectives Module

Collection of different perspectives for analyzing and captioning images.
Each perspective provides a unique way of understanding and describing visual content.

Perspectives:
    GraphCaption: Structured analysis with categorized tags
    ArtCritic: Artistic analysis focusing on composition and technique
"""

from .art_critic import ArtCriticProcessor
from .graph import GraphCaptionProcessor

__all__ = ["GraphCaptionProcessor", "ArtCriticProcessor"]
