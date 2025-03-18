"""
# SPDX-License-Identifier: Apache-2.0
Directory Loader Module

Provides functions for finding directories that contain perspective files.
"""

from pathlib import Path
from typing import List


def get_perspective_directories() -> List[Path]:
    """Get all directories where perspectives can be found."""
    from ..constants import WORKSPACE_PERSPECTIVES_DIR

    dirs = [WORKSPACE_PERSPECTIVES_DIR]

    # Check for local perspective directory in user's home
    local_dir = Path.home() / ".graphcap" / "perspectives"
    if local_dir.exists():
        dirs.append(local_dir)

    # Also check for "perspective_library" directory that seems to be used
    perspective_library = Path("/workspace") / "perspective_library"
    if perspective_library.exists():
        dirs.append(perspective_library)

    return dirs
