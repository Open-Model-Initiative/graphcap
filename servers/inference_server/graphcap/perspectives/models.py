"""
# SPDX-License-Identifier: Apache-2.0
Perspective Models Module

Contains the data models used for perspective configuration and management.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from typing_extensions import override

from .base import PerspectiveData


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

    # Metadata fields
    module: str = Field(default="default", description="Module this perspective belongs to")
    tags: List[str] = Field(default_factory=list, description="Tags for categorizing perspectives")
    description: str = Field(default="", description="Detailed description of the perspective")
    deprecated: bool = Field(default=False, description="Whether this perspective is deprecated")
    replacement: Optional[str] = Field(default=None, description="Name of perspective that replaces this one")
    priority: int = Field(default=100, description="Priority for sorting (lower is higher priority)")


class ModuleConfig(BaseModel):
    """Configuration for module settings."""

    enabled: bool = True
    display_name: Optional[str] = None


class PerspectiveSettings(BaseModel):
    """Settings for perspectives configuration."""

    modules: Dict[str, ModuleConfig] = {}
    local_override: bool = True
