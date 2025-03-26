"""
# SPDX-License-Identifier: Apache-2.0
Module Loader

Provides utilities for loading perspective modules and organizing
perspectives by module.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

from loguru import logger

from ..models import PerspectiveConfig, PerspectiveSettings
from ..module import PerspectiveModule
from ..processor import JsonPerspectiveProcessor
from .directory import get_perspective_directories
from .json_file import prepare_module_from_file_path
from .settings import load_module_settings


def find_json_files(config_dir: Path) -> List[Path]:
    """
    Find all JSON files in a directory recursively.

    Args:
        config_dir: Directory to search

    Returns:
        List of paths to JSON files
    """
    if not config_dir.exists():
        logger.warning(f"Perspective directory does not exist: {config_dir}")
        return []

    logger.info(f"Scanning for JSON files in: {config_dir}")
    json_files = list(config_dir.rglob("*.json"))
    logger.info(f"Found {len(json_files)} JSON files in {config_dir}")
    return json_files


def load_json_file(json_path: Path) -> Optional[dict]:
    """
    Load a JSON file safely.

    Args:
        json_path: Path to the JSON file

    Returns:
        Loaded JSON data as a dictionary, or None if loading failed
    """
    logger.info(f"Attempting to load perspective from: {json_path}")
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            config_data = json.load(f)
            logger.info(f"Successfully read JSON from: {json_path}")
            return config_data
    except Exception as e:
        logger.error(f"Failed to load perspective from {json_path}: {str(e)}")
        logger.exception(e)  # This will log the full stack trace
        return None


def validate_perspective_name(config_data: dict, json_path: Path, processed_names: Set[str]) -> Optional[str]:
    """
    Validate the perspective name and check for duplicates.

    Args:
        config_data: The perspective configuration data
        json_path: Path to the JSON file
        processed_names: Set of already processed perspective names

    Returns:
        The perspective name if valid, None otherwise
    """
    name = config_data.get("name")
    if not name:
        logger.warning(f"Skipping {json_path}: Missing 'name' field")
        return None

    # Check for duplicates - later files override earlier ones
    if name in processed_names:
        logger.info(f"Duplicate perspective name '{name}' found in {json_path}, overriding previous definition")

    return name


def create_perspective_processor(
    config_data: dict, json_path: Path, config_dir: Path
) -> Optional[JsonPerspectiveProcessor]:
    """
    Create a perspective processor from config data.

    Args:
        config_data: The perspective configuration data
        json_path: Path to the JSON file
        config_dir: Base directory for perspectives

    Returns:
        JsonPerspectiveProcessor instance, or None if creation failed
    """
    try:
        # Prepare module information from file path if not specified
        prepare_module_from_file_path(config_data, json_path, config_dir)

        # Create perspective config and processor
        config = PerspectiveConfig(**config_data)
        perspective = JsonPerspectiveProcessor(config)

        return perspective
    except Exception as e:
        logger.error(f"Failed to create PerspectiveConfig from {json_path}: {str(e)}")
        return None


def prepare_module(module_name: str, settings: PerspectiveSettings) -> PerspectiveModule:
    """
    Prepare a module with appropriate settings.

    Args:
        module_name: The name of the module
        settings: Perspective settings

    Returns:
        New PerspectiveModule instance
    """
    # Create module with default settings or from config
    display_name = module_name.replace("_", " ").title()
    if module_name in settings.modules and settings.modules[module_name].display_name:
        module_display_name = settings.modules[module_name].display_name
        # Ensure display_name is not None
        if module_display_name is not None:
            display_name = module_display_name

    enabled = True
    if module_name in settings.modules:
        enabled = settings.modules[module_name].enabled

    return PerspectiveModule(
        name=module_name,
        display_name=display_name,
        enabled=enabled,
    )


def process_json_file(
    json_path: Path,
    config_dir: Path,
    modules: Dict[str, PerspectiveModule],
    processed_names: Set[str],
    settings: PerspectiveSettings,
) -> Tuple[Optional[str], Optional[JsonPerspectiveProcessor]]:
    """
    Process a single JSON file and create perspective processor.

    Args:
        json_path: Path to the JSON file
        config_dir: Base directory for perspectives
        modules: Dictionary of existing modules
        processed_names: Set of already processed perspective names
        settings: Perspective settings

    Returns:
        Tuple of (perspective_name, perspective_processor) or (None, None) if processing failed
    """
    # Load the JSON file
    config_data = load_json_file(json_path)
    if not config_data:
        return None, None

    # Validate the perspective name
    name = validate_perspective_name(config_data, json_path, processed_names)
    if not name:
        return None, None

    # Create the perspective processor
    perspective = create_perspective_processor(config_data, json_path, config_dir)
    if not perspective:
        return None, None

    # Get or create the module
    module_name = perspective.module_name
    if module_name not in modules:
        modules[module_name] = prepare_module(module_name, settings)

    # Add perspective to module
    modules[module_name].add_perspective(perspective)

    logger.info(f"Successfully loaded perspective '{name}' from {json_path} in module '{module_name}'")
    return name, perspective


def process_config_directory(
    config_dir: Path,
    modules: Dict[str, PerspectiveModule],
    processed_names: Set[str],
    perspectives_by_name: Dict[str, JsonPerspectiveProcessor],
    settings: PerspectiveSettings,
) -> None:
    """
    Process all JSON files in a config directory.

    Args:
        config_dir: Directory to search for JSON files
        modules: Dictionary of modules to update
        processed_names: Set of processed perspective names
        perspectives_by_name: Dictionary of perspectives by name
        settings: Perspective settings
    """
    # Find all JSON files
    json_files = find_json_files(config_dir)

    # Process each JSON file
    for json_path in json_files:
        name, perspective = process_json_file(json_path, config_dir, modules, processed_names, settings)

        if name and perspective:
            processed_names.add(name)
            perspectives_by_name[name] = perspective


def get_all_modules(
    config_dirs: Optional[List[Path]] = None,
    settings: Optional[PerspectiveSettings] = None,
) -> Dict[str, PerspectiveModule]:
    """
    Load all perspective configurations and return organized by modules.

    Args:
        config_dirs: List of directories to search for perspective JSON files
        settings: Optional settings controlling which modules are enabled

    Returns:
        Dictionary mapping module names to module objects
    """
    if config_dirs is None:
        config_dirs = get_perspective_directories()

    if settings is None:
        settings = load_module_settings()

    # Track loaded modules and processed perspective names
    modules: Dict[str, PerspectiveModule] = {}
    processed_names: Set[str] = set()

    # Process each config directory
    for config_dir in config_dirs:
        process_config_directory(
            config_dir,
            modules,
            processed_names,
            {},  # Dummy perspectives_by_name - not used by get_all_modules
            settings,
        )

    logger.info(f"Total modules loaded: {len(modules)}")
    logger.info(f"Module names: {list(modules.keys())}")

    return modules


def load_all_perspectives(
    config_dirs: Optional[List[Path]] = None,
    settings: Optional[PerspectiveSettings] = None,
) -> Dict[str, JsonPerspectiveProcessor]:
    """
    Load all perspective configurations from directories and organize them by modules.

    Args:
        config_dirs: List of directories to search for perspective JSON files
        settings: Optional settings controlling which modules are enabled

    Returns:
        Dictionary mapping perspective names to their processors
    """
    if config_dirs is None:
        config_dirs = get_perspective_directories()

    if settings is None:
        settings = load_module_settings()

    # Track loaded modules and perspectives
    modules: Dict[str, PerspectiveModule] = {}
    perspectives_by_name: Dict[str, JsonPerspectiveProcessor] = {}
    processed_names: Set[str] = set()

    # Process each config directory
    for config_dir in config_dirs:
        process_config_directory(config_dir, modules, processed_names, perspectives_by_name, settings)

    # Return flat dictionary for backward compatibility
    result = {}
    for module_name, module in modules.items():
        if module.enabled:
            for name, perspective in module.perspectives.items():
                result[name] = perspective

    logger.info(f"Total perspectives loaded: {len(result)}")
    logger.info(f"Loaded perspective names: {list(result.keys())}")
    logger.info(f"Modules: {list(modules.keys())}")

    return result
