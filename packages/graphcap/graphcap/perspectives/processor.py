"""
# SPDX-License-Identifier: Apache-2.0
Perspective Processor Module

Provides implementation of the perspective processor class that handles
dynamically created schema models and implements conversion methods.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from loguru import logger
from pydantic import Field, create_model
from rich.table import Table
from typing_extensions import override

from .base import BasePerspective, PerspectiveData
from .models import PerspectiveConfig


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

    @property
    def config_name(self) -> str:
        """Get the configuration name."""
        return self.config.name

    @property
    def version(self) -> str:
        """Get the perspective version."""
        return self.config.version

    @property
    def module_name(self) -> str:
        """Get the module name."""
        return self.config.module

    @property
    def tags(self) -> List[str]:
        """Get the perspective tags."""
        return self.config.tags

    @property
    def description(self) -> str:
        """Get the perspective description."""
        return self.config.description

    @property
    def is_deprecated(self) -> bool:
        """Check if the perspective is deprecated."""
        return self.config.deprecated

    @property
    def replacement(self) -> Optional[str]:
        """Get the replacement perspective name if deprecated."""
        return self.config.replacement

    @property
    def priority(self) -> int:
        """Get the perspective priority."""
        return self.config.priority
