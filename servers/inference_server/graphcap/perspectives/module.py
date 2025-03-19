"""
# SPDX-License-Identifier: Apache-2.0
Perspective Module

Provides module functionality for organizing perspectives into groups
that can be enabled or disabled.
"""

from typing import Dict

from pydantic import BaseModel

from .processor import JsonPerspectiveProcessor


class PerspectiveModule(BaseModel):
    """Represents a module of related perspectives."""

    name: str
    display_name: str
    enabled: bool = True
    perspectives: Dict[str, JsonPerspectiveProcessor] = {}

    model_config = {"arbitrary_types_allowed": True}

    def toggle(self, enabled: bool) -> None:
        """Toggle this module on or off."""
        self.enabled = enabled

    def get_perspectives(self) -> Dict[str, JsonPerspectiveProcessor]:
        """Get all perspectives in this module if enabled."""
        if not self.enabled:
            return {}
        return self.perspectives

    def add_perspective(self, perspective: JsonPerspectiveProcessor) -> None:
        """Add a perspective to this module."""
        self.perspectives[perspective.config.name] = perspective
