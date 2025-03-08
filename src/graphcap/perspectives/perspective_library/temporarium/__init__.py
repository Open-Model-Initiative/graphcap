# SPDX-License-Identifier: Apache-2.0
"""
Temporarium Caption Perspective

This module provides the TemporariumCaptionProcessor and type definitions for generating captions 
rich in temporal context, historical narrative, and speculative futurism.
"""

from .processor import TemporariumCaptionProcessor
from .types import TemporariumCaptionData, ParsedData, CaptionData

__all__ = ["TemporariumCaptionProcessor", "TemporariumCaptionData", "ParsedData", "CaptionData"]