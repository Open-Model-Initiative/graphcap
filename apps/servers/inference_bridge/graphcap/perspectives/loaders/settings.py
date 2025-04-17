"""
# SPDX-License-Identifier: Apache-2.0
Perspective Settings Loader

Provides utilities for loading perspective module settings from configuration files.
"""

import json
from pathlib import Path
from typing import Union

from loguru import logger

from ..models import PerspectiveSettings


def load_module_settings(settings_path: Union[str, Path, None] = None) -> PerspectiveSettings:
    """
    Load module settings from a JSON file.

    Args:
        settings_path: Path to the settings file, or None to use the default

    Returns:
        PerspectiveSettings model with loaded settings or defaults
    """
    default_settings = PerspectiveSettings()

    if settings_path is None:
        # Default settings path
        settings_path = Path("/workspace") / "config" / "perspective_settings.json"

    if not Path(settings_path).exists():
        logger.info(f"No module settings found at {settings_path}, using defaults")
        return default_settings

    try:
        with open(settings_path, "r") as f:
            settings_data = json.load(f)
        return PerspectiveSettings(**settings_data)
    except Exception as e:
        logger.error(f"Failed to load module settings from {settings_path}: {str(e)}")
        return default_settings
