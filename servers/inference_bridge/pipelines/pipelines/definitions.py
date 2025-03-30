# SPDX-License-Identifier: Apache-2.0
"""Pipeline definitions combining all assets and resources."""

import dagster as dg

from .assets import assets
from .common.io import SimpleFileSystemIOManager

# Import custom logging configuration
from .common.logging import configure_loggers

# Import resources and IO managers
from .common.resources import FileSystemConfig, PerspectiveConfig, PostgresConfig, ProviderConfigFile
from .huggingface import huggingface_client
from .huggingface.types import HfUploadManifestConfig

# Import jobs
from .jobs import JOBS
from .perspectives.jobs import PerspectivePipelineRunConfig

# Configure custom loggers
loggers = configure_loggers()

# Combine all definitions
defs = dg.Definitions(
    assets=[*assets],
    resources={
        "postgres": PostgresConfig(),
        "fs": FileSystemConfig(),
        "fs_io_manager": SimpleFileSystemIOManager(),
        "huggingface_client": huggingface_client,
        "provider_config_file": ProviderConfigFile.configure_at_launch(),
        "hf_upload_manifest_config": HfUploadManifestConfig,
        "perspective_config": PerspectiveConfig.configure_at_launch(),
        "perspective_run_config": PerspectivePipelineRunConfig.configure_at_launch(),
        **loggers,  # Integrate custom loggers into resources
    },
    jobs=[*JOBS],
)
