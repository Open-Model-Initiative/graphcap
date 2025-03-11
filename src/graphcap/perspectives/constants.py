"""
# SPDX-License-Identifier: Apache-2.0
Common constants used across pipeline modules
"""

from pathlib import Path

# Workspace configuration
WORKSPACE_ROOT = Path("/workspace")
WORKSPACE_CONFIG_DIR = WORKSPACE_ROOT / "config"
WORKSPACE_PERSPECTIVES_DIR = WORKSPACE_CONFIG_DIR / "perspectives"
