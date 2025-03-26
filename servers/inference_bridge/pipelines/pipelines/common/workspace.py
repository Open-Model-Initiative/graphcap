# SPDX-License-Identifier: Apache-2.0
"""Workspace and mounted volume management."""

import os
from pathlib import Path

import dagster as dg


def ensure_workspace_dirs(context: dg.InitResourceContext) -> None:
    """Ensure required workspace directories exist."""
    dirs = ["/workspace/datasets", "/workspace/.local/output", "/workspace/logs"]
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)


def get_dataset_path(dataset_name: str) -> str:
    """Get full path to a dataset directory."""
    return os.path.join("/workspace/datasets", dataset_name)
