"""
# SPDX-License-Identifier: Apache-2.0
Base Caption Module

Provides base classes and shared functionality for different caption types.
"""

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, Optional, cast

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


class CaptionError(Exception):
    """Base exception for caption processing errors."""
    pass


class CaptionParsingError(CaptionError):
    """Exception raised when parsing JSON response fails."""
    pass


class CaptionProcessingError(CaptionError):
    """Exception raised when processing an image fails."""
    pass


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

    def _build_prompt_with_context(
        self, context: list[str] | None = None, global_context: str | None = None
    ) -> str:
        """
        Build the prompt with optional context.

        Args:
            context: List of context strings
            global_context: Global context string

        Returns:
            The complete prompt with context if provided
        """
        if not context and not global_context:
            return self.vision_config.prompt

        context_block = "<Contexts> Consider the following context when generating the caption:\n"
        
        if global_context:
            context_block += f"<GlobalContext>\n{global_context}\n</GlobalContext>\n"
            
        if context:
            for entry in context:
                context_block += f"<Context>\n{entry}\n</Context>\n"
                
        context_block += "</Contexts>\n"
        return f"{context_block}{self.vision_config.prompt}"

    def _parse_completion_result(self, completion: Any) -> Dict[str, Any]:
        """
        Parse the completion result into a standardized format.

        Args:
            completion: The completion response from the vision model

        Returns:
            Parsed result as a dictionary

        Raises:
            json.JSONDecodeError: If JSON parsing fails
        """
        # Handle BaseModel responses through duck typing
        if hasattr(completion, 'choices') and hasattr(completion.choices[0], 'message'):
            result = completion.choices[0].message.parsed
            if hasattr(result, 'model_dump'):
                return result.model_dump()
            return cast(Dict[str, Any], result)
            
        result = completion.choices[0].message.parsed
        
        # Handle string responses
        if isinstance(result, str):
            sanitized = self._sanitize_json_string(result)
            return json.loads(sanitized)
            
        # Handle nested structure responses
        if isinstance(result, dict):
            if "choices" in result:
                return cast(Dict[str, Any], result["choices"][0]["message"]["parsed"]["parsed"])
                
            if "message" in result:
                return cast(Dict[str, Any], result["message"]["parsed"])
            
        return cast(Dict[str, Any], result)

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
    ) -> Dict[str, Any]:
        """
        Process a single image and return caption data.

        Args:
            provider: Vision AI provider client instance
            image_path: Path to the image file
            model: Model name to use for processing
            max_tokens: Maximum tokens for model response
            temperature: Sampling temperature
            top_p: Nucleus sampling parameter
            repetition_penalty: Repetition penalty parameter
            context: List of context strings
            global_context: Global context string

        Returns:
            dict: Structured caption data according to schema

        Raises:
            CaptionParsingError: If parsing the JSON response fails
            CaptionProcessingError: If processing the image fails
        """
        try:
            # Build prompt with context if provided
            prompt = self._build_prompt_with_context(context, global_context)
            
            # Handle optional parameters with defaults
            tokens = 4096 if max_tokens is None else max_tokens
            temp = 0.8 if temperature is None else temperature
            nucleus = 0.9 if top_p is None else top_p
            rep_penalty = 1.15 if repetition_penalty is None else repetition_penalty
            
            # Process image with vision model
            completion = await provider.vision(
                prompt=prompt,
                image=image_path,
                schema=self.vision_config.schema,
                model=model,
                max_tokens=tokens,
                temperature=temp,
                top_p=nucleus,
                repetition_penalty=rep_penalty,
            )

            # Parse the completion result
            return self._parse_completion_result(completion)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise CaptionParsingError(f"Error parsing response for {image_path}: {str(e)}")
        except Exception as e:
            raise CaptionProcessingError(f"Error processing {image_path}: {str(e)}")

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
