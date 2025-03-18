# SPDX-License-Identifier: Apache-2.0
"""Shared resources for pipeline operations."""

import tomllib
from dataclasses import dataclass
from typing import Dict
from datetime import datetime
import dagster as dg
from pydantic import BaseModel, Field


@dataclass
class FileSystemConfig:
    """Filesystem configuration settings."""

    workspace_dir: str
    dataset_dir: str
    output_dir: str


@dataclass
class ProviderConfig:
    """Provider configuration settings."""

    default: str
    name: str
    provider_config_file: str


@dataclass
class IOConfig:
    """IO configuration settings."""

    dataset_name: str
    input_dir: str
    output_dir: str
    run_dir: str
    copy_images: bool
    sampling_strategy: str
    num_samples: int
    sorting_strategy: str


@dataclass
class PerspectiveConfig:
    """Perspective configuration settings."""

    global_context: str
    enabled_perspectives: Dict[str, bool] = Field(default_factory=dict)


class PerspectivePipelineConfig(BaseModel):
    """Configuration for pipeline runs loaded from TOML file."""

    perspective: PerspectiveConfig
    io: IOConfig
    provider: ProviderConfig
    filesystem: FileSystemConfig


class PerspectivePipelineRunConfig(dg.ConfigurableResource):
    """Configuration for pipeline runs loaded from TOML file."""

    config_path: str = Field(
        description="Path to the pipeline run configuration TOML file",
        default="/workspace/config/default_configs/pipeline_run_config.toml",
    )

    def load_dataset(self, context: dg.AssetExecutionContext) -> PerspectivePipelineConfig:
        """Load the configuration from the TOML file during resource initialization."""
        context.log.info(f"Self: {self}")
        context.log.info(f"Loading perspective pipeline run config from {self.config_path}")
        with open(self.config_path, "rb") as f:
            config = tomllib.load(f)

        # Create perspective config with enabled perspectives
        perspective = PerspectiveConfig(
            global_context=config["perspective"]["global_context"],
            enabled_perspectives=config["perspective"]["enabled"],
        )
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        run_dir = config["io"]["output_dir"] + "/" + timestamp
        # Create IO config
        io = IOConfig(
            dataset_name=config["io"]["dataset_name"],
            input_dir=config["io"]["input_dir"],
            output_dir=config["io"]["output_dir"],
            run_dir=run_dir,
            copy_images=config["io"]["copy_images"],
            sampling_strategy=config["io"]["sampling_strategy"],
            num_samples=config["io"]["num_samples"],
            sorting_strategy=config["io"]["sorting_strategy"],
        )

        # Create provider config
        provider = ProviderConfig(
            default=config["providers"]["default"]["name"],
            name=config["providers"]["default"]["name"],
            provider_config_file=config["providers"]["default"]["provider_config_file"],
        )

        # Create filesystem config
        filesystem = FileSystemConfig(
            workspace_dir=config["filesystem"]["workspace_dir"],
            dataset_dir=config["filesystem"]["dataset_dir"],
            output_dir=config["filesystem"]["output_dir"],
        )

        # Return the complete config object
        return PerspectivePipelineConfig(perspective=perspective, io=io, provider=provider, filesystem=filesystem)


@dg.asset
def perspective_pipeline_run_config(
    context: dg.AssetExecutionContext, perspective_run_config: PerspectivePipelineRunConfig
) -> PerspectivePipelineConfig:
    """Asset for perspective pipeline run config."""
    context.log.info(f"Config: {perspective_run_config}")
    pipeline_config = perspective_run_config.load_dataset(context)

    context.add_output_metadata({"config": pipeline_config.dict()})
    context.log.info(f"Perspective pipeline run config: {pipeline_config}")

    return pipeline_config
