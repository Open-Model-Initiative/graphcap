# SPDX-License-Identifier: Apache-2.0
"""Common helper functions."""

import json
from typing import Any, Dict

import pandas as pd


def load_jsonl(file_path: str) -> list[Dict[str, Any]]:
    """Load data from a JSONL file."""
    data = []
    with open(file_path, "r") as f:
        for line in f:
            data.append(json.loads(line))
    return data


def save_jsonl(data: list[Dict[str, Any]], file_path: str) -> None:
    """Save data to a JSONL file."""
    with open(file_path, "w") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")


def dataframe_to_jsonl(df: pd.DataFrame, file_path: str) -> None:
    """Convert DataFrame to JSONL and save."""
    df.to_json(file_path, orient="records", lines=True)
