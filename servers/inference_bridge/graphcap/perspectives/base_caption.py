"""
# SPDX-License-Identifier: Apache-2.0
Base Caption Module

Provides base classes and shared functionality for different caption types.
"""

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, Optional

from loguru import logger
from pydantic import BaseModel
from rich.console import Console
from rich.table import Table

from ..providers.clients.base_client import BaseClient
from .types import StructuredVisionConfig

# Initialize Rich console
console = Console()


def pretty_print_caption(caption_data: Dict[str, Any]) -> str:
    """Format caption data for pretty console output."""
    return json.dumps(caption_data["parsed"], indent=2, ensure_ascii=False)


class BaseCaptionProcessor(ABC):
    """
    Base class for caption processors.

    Provides shared functionality for processing images with vision models
    and handling responses. Subclasses implement specific caption formats.

    Attributes:
        config_name (str): Name of this caption processor
        version (str): Version of the processor
        prompt (str): Instruction prompt for the vision model
        schema (BaseModel): Pydantic model for response validation
    """

    def __init__(
        self,
        config_name: str,
        version: str,
        prompt: str,
        schema: type[BaseModel],
    ):
        self.vision_config = StructuredVisionConfig(
            config_name=config_name,
            version=version,
            prompt=prompt,
            schema=schema,
        )

    def _sanitize_json_string(self, text: str) -> str:
        """
        Sanitize JSON string by properly escaping control characters.

        Args:
            text: Raw JSON string that may contain control characters

        Returns:
            Sanitized JSON string with properly escaped control characters
        """
        # Define escape sequences for common control characters
        control_char_map = {
            "\n": "\\n",  # Line feed
            "\r": "\\r",  # Carriage return
            "\t": "\\t",  # Tab
            "\b": "\\b",  # Backspace
            "\f": "\\f",  # Form feed
            "\v": "\\u000b",  # Vertical tab
            "\0": "",  # Null character - remove it
        }

        # First pass: handle known control characters
        for char, escape_seq in control_char_map.items():
            text = text.replace(char, escape_seq)

        # Second pass: handle any remaining control characters
        result = ""
        for char in text:
            if ord(char) < 32:  # Control characters are below ASCII 32
                result += f"\\u{ord(char):04x}"
            else:
                result += char

        return result

    @abstractmethod
    def create_rich_table(self, caption_data: Dict[str, Any]) -> Table:
        """
        Create a Rich table for displaying caption data.

        Args:
            caption_data: The caption data to format

        Returns:
            Rich Table object for display
        """
        pass

    async def process_single(
        self,
        provider: BaseClient,
        image_path: Path,
        model: str,
        max_tokens: Optional[int] = 4096,
        temperature: Optional[float] = 0.8,
        top_p: Optional[float] = 0.9,
        repetition_penalty: Optional[float] = 1.15,
        context: list[str] | None = None,
        global_context: str | None = None,
    ) -> dict:
        """
        Process a single image and return caption data.

        Args:
            provider: Vision AI provider client instance
            image_path: Path to the image file
            model: Model name to use for processing
            max_tokens: Maximum tokens for model response
            temperature: Sampling temperature
            top_p: Nucleus sampling parameter

        Returns:
            dict: Structured caption data according to schema

        Raises:
            Exception: If image processing fails
        """
        if context or global_context:
            context_block = "<Contexts> Consider the following context when generating the caption:\n"
            if global_context:
                context_block += f"<GlobalContext>\n{global_context}\n</GlobalContext>\n"
            if context:
                for entry in context:
                    context_block += f"<Context>\n{entry}\n</Context>\n"
            context_block += "</Contexts>\n"
            prompt = f"{context_block}{self.vision_config.prompt}"
        else:
            prompt = self.vision_config.prompt
        try:
            completion = await provider.vision(
                prompt=prompt,
                image=image_path,
                schema=self.vision_config.schema,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                repetition_penalty=repetition_penalty,
            )

            # Handle response parsing with sanitization
            if isinstance(completion, BaseModel):
                result = completion.choices[0].message.parsed
                if isinstance(result, BaseModel):
                    result = result.model_dump()
            else:
                result = completion.choices[0].message.parsed
                # Handle string responses that need parsing
                if isinstance(result, str):
                    sanitized = self._sanitize_json_string(result)
                    try:
                        result = json.loads(sanitized)
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse sanitized JSON: {e}")
                        raise
                elif "choices" in result:
                    result = result["choices"][0]["message"]["parsed"]["parsed"]
                elif "message" in result:
                    result = result["message"]["parsed"]

            return result
        except Exception as e:
            raise Exception(f"Error processing {image_path}: {str(e)}")

    # Note: process_batch has been removed as batch processing is being migrated to Kafka.
    # Batch processing functionality should now be implemented in Kafka-based pipeline components.

    @abstractmethod
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert caption data to a flat dictionary suitable for tabular representation.

        Args:
            caption_data: The caption data to format

        Returns:
            Dict[str, Any]: Flattened dictionary for tabular representation
        """
        pass

    @abstractmethod
    def to_context(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert caption data to a context string suitable for downstream perspectives.
        """
        pass
