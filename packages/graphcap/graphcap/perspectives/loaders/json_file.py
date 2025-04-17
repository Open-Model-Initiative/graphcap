"""
# SPDX-License-Identifier: Apache-2.0
JSON File Loader

Provides utilities for loading perspective configurations from JSON files.
"""

import json
from pathlib import Path
from typing import Union

from ..models import PerspectiveConfig
from ..processor import JsonPerspectiveProcessor


def load_perspective_config(config_path: Union[str, Path]) -> PerspectiveConfig:
    """Load a perspective configuration from a JSON file."""
    with open(config_path, "r") as f:
        config_data = json.load(f)

    return PerspectiveConfig(**config_data)


def load_perspective_from_json(config_path: Union[str, Path]) -> JsonPerspectiveProcessor:
    """Load and instantiate a perspective from a JSON configuration file."""
    config = load_perspective_config(config_path)
    return JsonPerspectiveProcessor(config)


def prepare_module_from_file_path(config_data: dict, json_path: Path, config_dir: Path) -> None:
    """
    Prepare module information from file path if not specified in config.

    Args:
        config_data: The perspective configuration data
        json_path: Path to the JSON file
        config_dir: Base directory for perspectives
    """
    # If module is not specified in the file, use directory name as module
    if "module" not in config_data:
        # Use parent directory name as module, or "default" if at root
        rel_path = json_path.relative_to(config_dir)
        if len(rel_path.parts) > 1:
            config_data["module"] = rel_path.parts[0]
        else:
            config_data["module"] = "default"
