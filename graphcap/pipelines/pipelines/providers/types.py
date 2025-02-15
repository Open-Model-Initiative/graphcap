# SPDX-License-Identifier: Apache-2.0
"""Type definitions for the provider management system."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class RateLimits:
    """Rate limits for a provider"""

    requests_per_minute: Optional[int] = None
    tokens_per_minute: Optional[int] = None


@dataclass
class ProviderConfig:
    """Configuration for a provider"""

    kind: str
    environment: str  # 'cloud' or 'local'
    env_var: str
    base_url: str
    models: list[str]
    default_model: str
    fetch_models: bool = False
    rate_limits: Optional[RateLimits] = None
