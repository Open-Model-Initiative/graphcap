"""
# SPDX-License-Identifier: Apache-2.0
Perspective Loader Module

Provides utilities for loading and instantiating caption perspectives from JSON configuration files.
This module reduces code duplication by allowing perspectives to be defined declaratively.
"""

# Re-export models for backward compatibility
# Re-export loader functions
from .loaders import (
    get_all_modules,
    get_perspective_directories,
    load_all_perspectives,
    load_module_settings,
    load_perspective_config,
    load_perspective_from_json,
)
from .models import (
    ModuleConfig,
    PerspectiveConfig,
    PerspectiveSettings,
    SchemaField,
)

# Re-export module
from .module import PerspectiveModule

# Re-export processor
from .processor import JsonPerspectiveProcessor

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
