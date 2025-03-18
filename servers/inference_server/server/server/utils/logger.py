"""
# SPDX-License-Identifier: Apache-2.0
Logger Configuration Module

Configures and provides a customized loguru logger with JSON formatting
and colored output.

Key features:
- JSON pretty printing
- Colored console output
- Timestamp formatting
- Source location tracking
- Custom record formatting

Functions:
    format_record: Custom formatter for log records
"""

import json
import sys
from typing import Any

from loguru import logger


def format_record(record: dict) -> str:
    """Custom formatter for log records that pretty prints JSON/dict objects"""

    def format_value(value: Any) -> str:
        if isinstance(value, (dict, list)):
            return "\n" + json.dumps(value, indent=2, ensure_ascii=False)
        return str(value)

    # Format the message if it's a dict or list
    record["message"] = format_value(record["message"])

    # Use loguru's default formatting
    return (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>\n"
    )


# Remove any existing handlers
logger.remove()

# Add our custom colored handler with JSON formatting
logger.add(
    sys.stderr,
    format=format_record,
    colorize=True,
    level="DEBUG",
)

# Export the configured logger
__all__ = ["logger"]
