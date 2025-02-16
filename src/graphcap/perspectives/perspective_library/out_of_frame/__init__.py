# SPDX-License-Identifier: Apache-2.0
"""
Out-of-Frame Caption Perspective

Provides a creative captioning perspective that extends descriptions beyond the visible frame,
imaginatively speculating about what might exist off-camera.
"""

from .processor import OutOfFrameProcessor
from .types import OutOfFrameCaptionData

__all__ = ["OutOfFrameProcessor", "OutOfFrameCaptionData"]
