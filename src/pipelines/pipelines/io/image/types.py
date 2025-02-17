import enum

import dagster as dg
from pydantic import Field


class SamplingStrategy(str, enum.Enum):
    """Enum for sampling strategies."""

    INCREMENT = "increment"
    DECREMENT = "decrement"
    RANDOM = "random"


class SortingStrategy(str, enum.Enum):
    """Enum for sorting strategies."""

    NAME = "name"
    SIZE = "size"
    MODIFIED = "modified"


class DatasetIOConfig(dg.Config):
    """Configuration for dataset operations."""

    dataset_name: str = Field(default="graphcap_dataset", description="The name of the dataset.")
    input_dir: str = Field(default="/workspace/datasets/os_img", description="The input directory for the dataset.")
    output_dir: str = Field(
        default="/workspace/.local/output/os_img", description="The output directory for the dataset."
    )
    copy_images: bool = Field(default=True, description="Whether to copy images to the output directory.")
    sampling_strategy: SamplingStrategy = Field(
        default=SamplingStrategy.INCREMENT, description="The sampling strategy to use."
    )
    num_samples: int | None = Field(default=None, description="The number of samples to take.")
    sorting_strategy: SortingStrategy | None = Field(default=None, description="The sorting strategy to use.")
