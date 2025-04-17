"""
# SPDX-License-Identifier: Apache-2.0
Base Perspective Module

Provides base classes and utilities for implementing caption perspectives.
"""

from abc import abstractmethod
from pathlib import Path
from typing import Any, Dict

from pydantic import BaseModel
from rich.table import Table

from .base_caption import BaseCaptionProcessor


class PerspectiveData(BaseModel):
    """Base model for perspective data."""

    def __init_subclass__(cls, **kwargs):
        """Ensure subclasses can be used as schema."""
        super().__init_subclass__(**kwargs)


class BasePerspective(BaseCaptionProcessor):
    """
    Base class for implementing caption perspectives.

    Attributes:
        config_name (str): Name of the perspective configuration
        version (str): Version of the perspective
        prompt (str): Prompt template for the perspective
        schema (Type[PerspectiveData]): Data schema for the perspective
    """

    def __init__(
        self,
        config_name: str,
        version: str,
        prompt: str,
        schema: type[PerspectiveData],
    ):
        super().__init__(
            config_name=config_name,
            version=version,
            prompt=prompt,
            schema=schema,
        )

    @abstractmethod
    def create_rich_table(self, caption_data: Dict[str, Any]) -> Table:
        """Create Rich table for displaying caption data."""
        pass

    def write_outputs(self, job_dir: Path, caption_data: Dict[str, Any]) -> None:
        """Write perspective outputs to the job directory."""
        pass
