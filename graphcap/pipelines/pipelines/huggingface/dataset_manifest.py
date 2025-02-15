# SPDX-License-Identifier: Apache-2.0
"""Module for generating and handling dataset manifests."""

import json
from pathlib import Path
from typing import Any, Dict, List

from ..perspectives.types import PerspectiveCaptionResult


def create_mock_perspective_results() -> List[Dict[str, Any]]:
    """Creates mock perspective results for demonstration purposes."""
    return [
        {
            "filename": "image1.jpg",
            "config_name": "default",
            "version": "1.0",
            "model": "graphcap",
            "provider": "graphcap_provider",
            "parsed": {"tags_list": ["tag1", "tag2"], "short_caption": "A short caption."},
        },
        {
            "filename": "image2.jpg",
            "config_name": "default",
            "version": "1.0",
            "model": "graphcap",
            "provider": "graphcap_provider",
            "parsed": {"tags_list": ["tag3", "tag4"], "short_caption": "Another short caption."},
        },
    ]


def create_dataset_manifest(export_dir: Path, perspective_results: List[PerspectiveCaptionResult]) -> Path:
    """Creates a dataset manifest file."""
    manifest_path = export_dir / "manifest.json"
    with open(manifest_path, "w") as f:
        for result in perspective_results:
            f.write(json.dumps(result) + "\n")
    return manifest_path


def load_perspective_results_from_manifest(manifest_path: Path) -> List[Dict[str, Any]]:
    """Loads perspective results from a dataset manifest file."""
    perspective_results: List[Dict[str, Any]] = []
    with open(manifest_path, "r") as f:
        for line in f:
            perspective_results.append(json.loads(line))
    return perspective_results
