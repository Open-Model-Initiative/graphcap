"""
# SPDX-License-Identifier: Apache-2.0
Perspective Loader Module

Provides utilities for loading and instantiating caption perspectives from JSON configuration files.
This module reduces code duplication by allowing perspectives to be defined declaratively.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Union

from loguru import logger
from pydantic import BaseModel, Field, create_model
from rich.table import Table
from typing_extensions import override

from .base import BasePerspective, PerspectiveData


class SchemaField(BaseModel):
    """Definition of a field in a perspective schema."""

    name: str
    type: str
    description: str
    is_list: bool = False


class PerspectiveConfig(BaseModel):
    """Configuration for a perspective loaded from JSON."""

    name: str
    display_name: str
    version: str
    prompt: str
    schema_fields: List[SchemaField]
    table_columns: List[Dict[str, str]]
    context_template: str


class JsonPerspectiveProcessor(BasePerspective):
    """
    Processor for perspectives defined in JSON configuration files.

    This class dynamically creates schema models and implements methods
    based on the configuration provided in the JSON file.
    """

    def __init__(self, config: PerspectiveConfig):
        """Initialize the processor with a JSON configuration."""
        self.config = config
        self.display_name = config.display_name

        # Dynamically create schema model from JSON definition
        schema_fields = {}
        for field in config.schema_fields:
            field_type = self._get_field_type(field.type, field.is_list)
            schema_fields[field.name] = (field_type, Field(description=field.description))

        # Create the schema model dynamically
        schema_class = create_model(f"{config.name.capitalize()}Schema", __base__=PerspectiveData, **schema_fields)

        super().__init__(
            config_name=config.name,
            version=config.version,
            prompt=config.prompt,
            schema=schema_class,
        )

    def _get_field_type(self, type_name: str, is_list: bool) -> Any:
        """Convert string type name to actual Python type."""
        type_map = {
            "str": str,
            "int": int,
            "float": float,
            "bool": bool,
        }

        base_type = type_map.get(type_name, str)
        if is_list:
            return List[base_type]
        return base_type

    @override
    def create_rich_table(self, caption_data: Dict[str, Any]) -> Table:
        """Create Rich table for displaying caption data based on JSON config."""
        result = caption_data["parsed"]

        table = Table(show_header=True, header_style="bold magenta", expand=True)

        # Add columns based on configuration
        for column in self.config.table_columns:
            table.add_column(column["name"], style=column.get("style", "default"))

        # Add rows based on schema fields
        rows = []
        for field in self.config.schema_fields:
            field_name = field.name
            field_value = result.get(field_name, "")

            # Format list values if needed
            if field.is_list and isinstance(field_value, list):
                field_value = "\n".join(f"• {item}" for item in field_value)

            rows.append(field_value)

        table.add_row(*rows)
        logger.info(f"Generated {self.display_name} for {caption_data['filename']}")
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: Dict[str, Any]) -> None:
        """Write perspective outputs to the job directory."""
        result = caption_data["parsed"]

        # Create output dictionary
        output = {"filename": caption_data["filename"], "analysis": {}}

        # Add each field from the parsed result
        for field in self.config.schema_fields:
            field_name = field.name
            output["analysis"][field_name] = result.get(field_name, "")

        # Write to JSON file
        response_file = job_dir / f"{self.config.name}_response.json"
        with response_file.open("a") as f:
            json.dump(output, f, indent=2)
            f.write("\n")  # Separate entries by newline

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert perspective data to a flat dictionary."""
        result = caption_data.get("parsed", {})

        # Check for error
        if "error" in result:
            return {
                "filename": caption_data.get("filename", "unknown"),
                "error": result["error"],
            }

        # Create output dictionary with filename
        output = {"filename": caption_data.get("filename", "unknown")}

        # Add each field from the parsed result
        for field in self.config.schema_fields:
            field_name = field.name
            field_value = result.get(field_name, "")

            # Format list values if needed
            if field.is_list and isinstance(field_value, list):
                field_value = ", ".join(field_value)

            output[field_name] = field_value

        return output

    @override
    def to_context(self, caption_data: Dict[str, Any]) -> str:
        """Convert perspective data to a context string using the template."""
        result = caption_data.get("parsed", {})

        # Replace placeholders in the template with actual values
        context = self.config.context_template
        for field in self.config.schema_fields:
            field_name = field.name
            field_value = result.get(field_name, "")

            # Format list values if needed
            if field.is_list and isinstance(field_value, list):
                field_value = ", ".join(field_value)

            # Replace placeholder with value
            placeholder = f"{{{field_name}}}"
            context = context.replace(placeholder, str(field_value))

        return context


def load_perspective_config(config_path: Union[str, Path]) -> PerspectiveConfig:
    """Load a perspective configuration from a JSON file."""
    with open(config_path, "r") as f:
        config_data = json.load(f)

    return PerspectiveConfig(**config_data)


def load_perspective_from_json(config_path: Union[str, Path]) -> JsonPerspectiveProcessor:
    """Load and instantiate a perspective from a JSON configuration file."""
    config = load_perspective_config(config_path)
    return JsonPerspectiveProcessor(config)


def load_all_perspectives(config_dir: Union[str, Path]) -> Dict[str, JsonPerspectiveProcessor]:
    """
    Load all perspective configurations from a directory and its subdirectories.

    Args:
        config_dir: Path to the directory containing perspective JSON configurations

    Returns:
        Dictionary mapping perspective names to their processors
    """
    config_dir = Path(config_dir)
    perspectives: Dict[str, JsonPerspectiveProcessor] = {}

    logger.info(f"Scanning for JSON files in: {config_dir}")
    # Recursively find all JSON files
    json_files = list(config_dir.rglob("*.json"))
    logger.info(f"Found JSON files: {json_files}")

    for json_path in json_files:
        logger.info(f"Attempting to load perspective from: {json_path}")
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                config_data = json.load(f)
                logger.info(f"Successfully read JSON from: {json_path}")

            # Each perspective must have a unique name
            name = config_data.get("name")
            if not name:
                logger.warning(f"Skipping {json_path}: Missing 'name' field")
                continue

            if name in perspectives:
                logger.warning(f"Duplicate perspective name '{name}' found in {json_path}, skipping")
                continue

            # Convert the dictionary to a PerspectiveConfig model
            try:
                config = PerspectiveConfig(**config_data)
                perspectives[name] = JsonPerspectiveProcessor(config)
                logger.info(f"Successfully loaded perspective '{name}' from {json_path}")
            except Exception as e:
                logger.error(f"Failed to create PerspectiveConfig from {json_path}: {str(e)}")
                continue

        except Exception as e:
            logger.error(f"Failed to load perspective from {json_path}: {str(e)}")
            logger.exception(e)  # This will log the full stack trace
            continue

    logger.info(f"Total perspectives loaded: {len(perspectives)}")
    logger.info(f"Loaded perspective names: {list(perspectives.keys())}")
    return perspectives
