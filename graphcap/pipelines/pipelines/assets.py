# SPDX-License-Identifier: Apache-2.0
"""Asset exports for the pipeline package.

This module provides a central point for importing and re-exporting all assets
used in the pipeline system. This simplifies imports in other modules and provides
a clear overview of available assets.

Key features:
- Centralized asset imports
- Organized by feature area
- Type-safe exports
"""

# Feature imports
from .huggingface import ASSETS as HUGGINGFACE_ASSETS
from .io import ASSETS as IO_ASSETS
from .perspectives import ASSETS as PERSPECTIVES
from .providers import ASSETS as PROVIDERS

# Re-export all assets
assets = [
    # Image analysis
    *IO_ASSETS,
    # Caption generation
    *PERSPECTIVES,
    # Dataset management
    *HUGGINGFACE_ASSETS,
    # Provider management
    *PROVIDERS,
]
