# SPDX-License-Identifier: Apache-2.0
"""IO management for pipeline operations."""

import os
from typing import List

import dagster as dg


class SimpleFileSystemIOManager(dg.IOManager):
    """Manages file system I/O operations."""

    def handle_output(self, context: dg.OutputContext, obj: List[str]):
        """Handle output of file paths."""
        context.log.info(f"Outputting image paths: {obj}")

    def load_input(self, context: dg.InputContext) -> List[str]:
        """Load input files from directory."""
        image_dir = "/workspace/datasets/os_img"
        return [os.path.join(image_dir, f) for f in os.listdir(image_dir) if os.path.isfile(os.path.join(image_dir, f))]
