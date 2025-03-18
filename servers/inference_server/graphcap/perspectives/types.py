# SPDX-License-Identifier: Apache-2.0
"""Type definitions for perspectives assets."""

from dataclasses import dataclass
from typing import Any, Dict, List, TypedDict

from pydantic import BaseModel


class PerspectiveCaptionResult(TypedDict):
    """Type definition for a single perspective caption result."""

    filename: str
    config_name: str
    version: str
    model: str
    provider: str
    parsed: Dict[str, Any]


PerspectiveCaptionOutput = List[PerspectiveCaptionResult]


@dataclass
class StructuredVisionConfig:
    config_name: str
    version: str
    prompt: str
    schema: BaseModel
