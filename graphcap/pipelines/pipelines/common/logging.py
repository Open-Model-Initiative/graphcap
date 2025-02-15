# SPDX-License-Identifier: Apache-2.0
"""Custom logging setup for Dagster pipelines."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


def configure_loggers():
    """Configures custom loggers for different levels."""
    dagster_logger = logging.getLogger("dagster")
    dagster_logger.setLevel(logging.DEBUG)  # Set default Dagster logger level

    # Ensure the log directory exists
    log_dir = Path("/workspace/logs/gcap_pipelines")
    log_dir.mkdir(parents=True, exist_ok=True)

    # Create handlers for different log levels
    debug_handler = logging.FileHandler(log_dir / "debug.log")
    debug_handler.setLevel(logging.DEBUG)
    error_handler = logging.FileHandler(log_dir / "error.log")
    error_handler.setLevel(logging.ERROR)

    # Define formatters
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    debug_handler.setFormatter(formatter)
    error_handler.setFormatter(formatter)

    # Add handlers to the Dagster logger
    dagster_logger.addHandler(debug_handler)
    dagster_logger.addHandler(error_handler)

    return {"custom_logger": dagster_logger}


def write_caption_results(results: List[Dict[str, Any]]):
    """Writes caption results to a JSON file in the log directory."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_dir = Path("/workspace/logs/gcap_pipelines")
    results_file = log_dir / f"caption_results_{timestamp}.json"

    try:
        with results_file.open("w") as f:
            json.dump(results, f, indent=2)
        logging.getLogger("dagster").info(f"Caption results written to {results_file}")
    except Exception as e:
        logging.getLogger("dagster").error(f"Failed to write caption results: {e}")
