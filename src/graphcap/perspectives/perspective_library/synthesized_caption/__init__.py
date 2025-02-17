# SPDX-License-Identifier: Apache-2.0
"""
Synthesized Caption Perspective

Integrates outputs from various captioning perspectives and the original image to generate
a final, synthesized caption.
"""

from .processor import SynthesizedCaptionProcessor
from .types import SynthesizedCaptionData, ParsedData, CaptionData

__all__ = ["SynthesizedCaptionProcessor", "SynthesizedCaptionData", "ParsedData", "CaptionData"]
