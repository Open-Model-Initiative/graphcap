"""
# SPDX-License-Identifier: Apache-2.0
Perspectives Package

Provides utilities for working with different perspectives/views of data.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional

from loguru import logger

from .constants import WORKSPACE_PERSPECTIVES_DIR
from .perspective_loader import (
    # Classes
    JsonPerspectiveProcessor,
    ModuleConfig,
    PerspectiveConfig,
    PerspectiveModule,
    PerspectiveSettings,
    # Models
    SchemaField,
    get_all_modules,
    # Functions
    get_perspective_directories,
    load_all_perspectives,
    load_module_settings,
    load_perspective_config,
    load_perspective_from_json,
)

# Load JSON-based perspectives from workspace config
_json_perspectives: Dict[str, JsonPerspectiveProcessor] = {}
_modules: Dict[str, PerspectiveModule] = {}

# Get all perspective directories
perspective_dirs = get_perspective_directories()
logger.info(f"Looking for perspectives in: {perspective_dirs}")

# Load module settings
settings = load_module_settings()

# Load perspectives organized by modules
try:
    _modules = get_all_modules(perspective_dirs, settings)
    _json_perspectives = load_all_perspectives(perspective_dirs, settings)

    # Log loaded modules and perspectives
    enabled_modules = [name for name, module in _modules.items() if module.enabled]
    logger.info(f"Loaded {len(_modules)} modules: {list(_modules.keys())}")
    logger.info(f"Enabled modules: {enabled_modules}")
    logger.info(f"Loaded {len(_json_perspectives)} perspectives: {list(_json_perspectives.keys())}")
except Exception as e:
    logger.error(f"Error loading perspectives: {str(e)}")
    logger.exception(e)


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
    logger.error(f"Perspectives directories: {perspective_dirs}")
    raise ValueError(f"Unknown perspective: {perspective_name}. Available perspectives: {available}")


def get_perspective_list() -> List[str]:
    """
    Get a list of available perspective names.

    Returns:
        A list of perspective names
    """
    return list(_json_perspectives.keys())


def get_perspective_modules() -> Dict[str, PerspectiveModule]:
    """
    Get all perspective modules.

    Returns:
        Dictionary mapping module names to module objects
    """
    return _modules


def get_module_perspectives(module_name: str) -> Dict[str, JsonPerspectiveProcessor]:
    """
    Get all perspectives in a specific module.

    Args:
        module_name: The name of the module

    Returns:
        Dictionary mapping perspective names to processors

    Raises:
        ValueError: If the module name is unknown
    """
    if module_name in _modules:
        return _modules[module_name].get_perspectives()

    available = list(_modules.keys())
    raise ValueError(f"Unknown module: {module_name}. Available modules: {available}")


def get_perspectives_by_tag(tag: str) -> Dict[str, JsonPerspectiveProcessor]:
    """
    Get all perspectives with a specific tag.

    Args:
        tag: The tag to filter by

    Returns:
        Dictionary mapping perspective names to processors
    """
    result = {}
    for name, perspective in _json_perspectives.items():
        if tag in perspective.tags:
            result[name] = perspective
    return result


def get_perspectives_by_tags(tags: List[str], match_all: bool = False) -> Dict[str, JsonPerspectiveProcessor]:
    """
    Get all perspectives matching the specified tags.

    Args:
        tags: List of tags to filter by
        match_all: If True, perspective must have all tags; if False, any matching tag is sufficient

    Returns:
        Dictionary mapping perspective names to processors
    """
    result = {}
    for name, perspective in _json_perspectives.items():
        if match_all:
            # All tags must match
            if all(tag in perspective.tags for tag in tags):
                result[name] = perspective
        else:
            # Any tag match is sufficient
            if any(tag in perspective.tags for tag in tags):
                result[name] = perspective
    return result


def toggle_module(module_name: str, enabled: bool) -> None:
    """
    Toggle a module on or off.

    Args:
        module_name: The name of the module to toggle
        enabled: Whether to enable or disable the module

    Raises:
        ValueError: If the module name is unknown
    """
    if module_name not in _modules:
        available = list(_modules.keys())
        raise ValueError(f"Unknown module: {module_name}. Available modules: {available}")

    _modules[module_name].toggle(enabled)

    # Reload perspectives to reflect changes
    global _json_perspectives
    _json_perspectives = {}
    for name, module in _modules.items():
        if module.enabled:
            for perspective_name, perspective in module.perspectives.items():
                _json_perspectives[perspective_name] = perspective


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


def get_non_deprecated_perspectives() -> Dict[str, JsonPerspectiveProcessor]:
    """
    Get all non-deprecated perspectives.

    Returns:
        Dictionary mapping perspective names to processors
    """
    return {name: p for name, p in _json_perspectives.items() if not p.is_deprecated}


def get_perspective_metadata() -> List[Dict[str, Any]]:
    """
    Get metadata for all perspectives.

    Returns:
        List of dictionaries with perspective metadata
    """
    result = []
    for name, perspective in _json_perspectives.items():
        result.append(
            {
                "name": name,
                "display_name": perspective.display_name,
                "version": perspective.version,
                "module": perspective.module_name,
                "tags": perspective.tags,
                "description": perspective.description,
                "deprecated": perspective.is_deprecated,
                "replacement": perspective.replacement,
                "priority": perspective.priority,
            }
        )

    # Sort by priority (lowest first)
    result.sort(key=lambda x: x["priority"])
    return result


__all__ = [
    # Models
    "SchemaField",
    "PerspectiveConfig",
    "ModuleConfig",
    "PerspectiveSettings",
    # Classes
    "JsonPerspectiveProcessor",
    "PerspectiveModule",
    # Functions
    "get_perspective_directories",
    "load_perspective_config",
    "load_perspective_from_json",
    "get_all_modules",
    "load_all_perspectives",
    "load_module_settings",
]
