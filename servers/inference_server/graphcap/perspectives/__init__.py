"""
# SPDX-License-Identifier: Apache-2.0
Caption Perspectives Module

Collection of different perspectives for analyzing and captioning images.
Each perspective provides a unique way of understanding and describing visual content.

Perspectives are defined in JSON configuration files in workspace/config/perspectives directory.
Each perspective configuration specifies its analysis approach and prompting strategy.
Perspectives can be organized in subdirectories for better organization.
"""

from pathlib import Path
from typing import Dict, List

from loguru import logger

from .constants import WORKSPACE_PERSPECTIVES_DIR
from .perspective_loader import JsonPerspectiveProcessor, load_all_perspectives

# Load JSON-based perspectives from workspace config
_json_perspectives: Dict[str, JsonPerspectiveProcessor] = {}

logger.info(f"Looking for perspectives in: {WORKSPACE_PERSPECTIVES_DIR}")
logger.info(f"Directory exists: {WORKSPACE_PERSPECTIVES_DIR.exists()}")
if WORKSPACE_PERSPECTIVES_DIR.exists():
    logger.info(f"Directory contents: {list(WORKSPACE_PERSPECTIVES_DIR.glob('*.json'))}")
    _json_perspectives = load_all_perspectives(WORKSPACE_PERSPECTIVES_DIR)
    logger.info(
        f"Loaded {len(_json_perspectives)} perspectives from workspace configurations: {list(_json_perspectives.keys())}"
    )
else:
    logger.warning(f"No perspective configurations found at {WORKSPACE_PERSPECTIVES_DIR}")


def get_perspective(perspective_name: str, **kwargs):
    """
    Get a perspective processor by name.

    Args:
        perspective_name: The name of the perspective to get
        **kwargs: Additional arguments to pass to the perspective processor

    Returns:
        A perspective processor instance

    Raises:
        ValueError: If the perspective name is unknown
    """
    if perspective_name in _json_perspectives:
        return _json_perspectives[perspective_name]

    available = list(_json_perspectives.keys())
    logger.error(f"Perspective {perspective_name} not found. Available: {available}")
    logger.error(f"Perspectives directory contents: {list(WORKSPACE_PERSPECTIVES_DIR.glob('*.json'))}")
    raise ValueError(f"Unknown perspective: {perspective_name}. Available perspectives: {available}")


def get_perspective_list() -> List[str]:
    """
    Get a list of available perspective names.

    Returns:
        A list of perspective names
    """
    return list(_json_perspectives.keys())


def get_synthesizer() -> JsonPerspectiveProcessor:
    """
    Get the synthesized caption processor.

    Returns:
        A JsonPerspectiveProcessor instance configured for synthesized captions

    Raises:
        ValueError: If the synthesized caption perspective is not found
    """
    try:
        return _json_perspectives["synthesized_caption"]
    except KeyError:
        raise ValueError("Synthesized caption perspective not found in JSON configurations")


__all__ = [
    "JsonPerspectiveProcessor",
    "get_perspective",
    "get_perspective_list",
    "get_synthesizer",
]
