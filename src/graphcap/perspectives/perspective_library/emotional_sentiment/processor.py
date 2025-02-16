# SPDX-License-Identifier: Apache-2.0
"""
Emotional & Sentiment-Based Caption Processor

Generates captions that focus on the emotional tone conveyed by the image.
This processor first analyzes the image to extract its emotional context and then composes
a caption that emphasizes mood and sentiment through expressive, descriptive language.
"""

import json
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from rich.table import Table
from typing_extensions import override

from ..base import BasePerspective
from .types import EmotionalSentimentCaptionData, ParsedData

# Instruction prompt for generating emotional and sentiment-based captions.
instruction = """<Task>You are an emotion analysis agent. Generate a caption that captures the emotional tone of the image.</Task>
<EmotionAnalysis note="Analyze the image to identify its emotional tone (e.g., joyful, somber, tranquil, melancholic, etc.).">
<SentimentCaption note="Compose a caption that reflects this emotional tone using descriptive and sentiment-laden language.">
"""

class EmotionalSentimentProcessor(BasePerspective):
    """
    Processor for generating emotional and sentiment-based captions.

    This processor extracts the emotional context from an image and then creates a caption
    that reflects the mood through evocative and descriptive language.
    """

    def __init__(self) -> None:
        super().__init__(
            config_name="emotional_sentiment",
            version="1",
            prompt=instruction,
            schema=EmotionalSentimentCaptionData,
        )

    @override
    def create_rich_table(self, caption_data: dict[str, ParsedData]) -> Table:
        """Create a Rich table for displaying emotional sentiment caption data."""
        result = caption_data["parsed"]

        table = Table(show_header=True, header_style="bold magenta", expand=True)
        table.add_column("Emotion Analysis", style="cyan")
        table.add_column("Sentiment Caption", style="green")

        table.add_row(result["emotion_analysis"], result["sentiment_caption"])
        logger.info(
            f"Generated sentiment caption for {caption_data['filename']}: {result['sentiment_caption']}"
        )
        return table

    @override
    def write_outputs(self, job_dir: Path, caption_data: dict[str, Any]) -> None:
        """Write the emotional sentiment caption outputs to the job directory."""
        result = caption_data["parsed"]

        response_file = job_dir / "emotional_sentiment_response.json"
        with response_file.open("a") as f:
            json.dump(
                {
                    "filename": caption_data["filename"],
                    "analysis": {
                        "emotion_analysis": result["emotion_analysis"],
                        "sentiment_caption": result["sentiment_caption"],
                    },
                },
                f,
                indent=2,
            )
            f.write("\n")  # Separate entries by newline

    @override
    def to_table(self, caption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert emotional sentiment caption data to a flat dictionary."""
        result = caption_data.get("parsed", {})
        if "error" in result:
            return {
                "filename": caption_data.get("filename", "unknown"),
                "error": result["error"],
            }

        return {
            "filename": caption_data.get("filename", "unknown"),
            "emotion_analysis": result.get("emotion_analysis", ""),
            "sentiment_caption": result.get("sentiment_caption", ""),
        }
