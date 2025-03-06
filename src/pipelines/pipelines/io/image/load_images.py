import os
import random
import shutil

import dagster as dg
from dagster import asset
from PIL import Image

from .types import DatasetIOConfig, SamplingStrategy, SortingStrategy
from ...perspectives.jobs.config import PerspectivePipelineConfig


def is_image_file(filename: str) -> bool:
    """Check if a file is an image based on its extension."""
    image_extensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".ico"]
    return any(filename.lower().endswith(ext) for ext in image_extensions)


def sort_image_files(image_files: list[str], sorting_strategy: SortingStrategy) -> list[str]:
    """Sort image files based on the specified strategy."""
    if sorting_strategy == SortingStrategy.NAME:
        image_files.sort()  # Sort by filename
    elif sorting_strategy == SortingStrategy.SIZE:
        image_files.sort(key=os.path.getsize)  # Sort by file size
    elif sorting_strategy == SortingStrategy.MODIFIED:
        image_files.sort(key=os.path.getmtime)  # Sort by modification time
    return image_files


def sample_image_files(
    image_files: list[str], sampling_strategy: SamplingStrategy, num_samples: int | None
) -> list[str]:
    """Sample image files based on the specified strategy."""
    if num_samples is None or num_samples >= len(image_files):
        return image_files  # Return all files if num_samples is None or too large

    if sampling_strategy == SamplingStrategy.INCREMENT:
        sampled_files = image_files[:num_samples]  # Take the first num_samples files
    elif sampling_strategy == SamplingStrategy.DECREMENT:
        sampled_files = image_files[-num_samples:]  # Take the last num_samples files
    elif sampling_strategy == SamplingStrategy.RANDOM:
        sampled_files = random.sample(image_files, num_samples)  # Take a random sample
    else:
        raise ValueError(f"Invalid sampling strategy: {sampling_strategy}")

    return sampled_files


def get_image_list(
    context: dg.AssetExecutionContext,
    image_dir: str,
    sorting_strategy: SortingStrategy | None,
    sampling_strategy: SamplingStrategy,
    num_samples: int | None,
) -> list[str]:
    """Load raw images from directory."""
    image_files = [
        os.path.join(image_dir, f)
        for f in os.listdir(image_dir)
        if os.path.isfile(os.path.join(image_dir, f)) and is_image_file(f)
    ]
    context.log.info(f"Found {len(image_files)} images in {image_dir}")

    # Sort images
    if sorting_strategy:
        image_files = sort_image_files(image_files, sorting_strategy)

    # Sample images
    image_files = sample_image_files(image_files, sampling_strategy, num_samples)

    return image_files


def copy_images(context: dg.AssetExecutionContext, image_paths: list[str], output_dir: str) -> list[str]:
    """Copy images to the output directory."""
    output_dir = output_dir + "/images"
    try:
        os.makedirs(output_dir, exist_ok=True)  # Ensure the output directory exists
    except FileExistsError:
        context.log.warning(f"Directory already exists: {output_dir}")
    new_image_paths = []

    for image_path in image_paths:
        try:
            new_image_path = os.path.join(output_dir, os.path.basename(image_path))
            shutil.copy(image_path, new_image_path)
            context.log.info(f"Image copied successfully: {image_path} to {new_image_path}")
            new_image_paths.append(new_image_path)
        except FileNotFoundError:
            context.log.error(f"File not found: {image_path}")
        except Exception as e:
            context.log.error(f"Error copying image {image_path}: {e}")

    return new_image_paths


@asset(group_name="image_load", compute_kind="python")
def image_list(context: dg.AssetExecutionContext, image_dataset_config: DatasetIOConfig) -> list[str]:
    """
    Load raw images from directory.

    Args:
        config (DatasetConfig): The dataset configuration.

    Returns:
        list[str]: A list of image paths.
    """
    context.log.info(f"Loading image list for dataset {image_dataset_config.dataset_name}")

    image_files = get_image_list(
        context=context,
        image_dir=image_dataset_config.input_dir,
        sorting_strategy=image_dataset_config.sorting_strategy,
        sampling_strategy=image_dataset_config.sampling_strategy,
        num_samples=image_dataset_config.num_samples,
    )
    copied_image_files: list[str] = copy_images(context, image_files, image_dataset_config.output_dir)
    return copied_image_files


def load_pil_images_op(context: dg.AssetExecutionContext, image_paths: list[str]) -> list[Image.Image]:
    """Load images using PIL."""
    pil_images = []
    for path in image_paths:
        try:
            img = Image.open(path)
            pil_images.append(img)
            context.log.info(f"Image loaded successfully: {path}")
        except FileNotFoundError:
            context.log.error(f"File not found: {path}")
        except Exception as e:
            context.log.error(f"Error loading image {path}: {e}")

    return pil_images


@asset(group_name="image_load", compute_kind="python")
def image_dataset_config(context: dg.AssetExecutionContext, config: DatasetIOConfig) -> DatasetIOConfig:
    """Load image dataset configuration."""
    context.log.info(f"Loading image dataset configuration: {config.dataset_name}")
    return config


@asset(
    group_name="image_load",
    compute_kind="python",
    deps=["perspective_pipeline_run_config"]
)
def perspective_image_list(
    context: dg.AssetExecutionContext,
    perspective_pipeline_run_config: PerspectivePipelineConfig
) -> list[str]:
    """
    Load raw images from directory using the perspective pipeline configuration.

    Args:
        perspective_pipeline_run_config (PerspectivePipelineConfig): The unified pipeline configuration.

    Returns:
        list[str]: A list of image paths.
    """
    io_config = perspective_pipeline_run_config.io
    
    context.log.info(f"Loading image list for dataset {io_config.dataset_name}")

    image_files = get_image_list(
        context=context,
        image_dir=io_config.input_dir,
        sorting_strategy=SortingStrategy(io_config.sorting_strategy),
        sampling_strategy=SamplingStrategy(io_config.sampling_strategy),
        num_samples=io_config.num_samples,
    )
    
    copied_image_files: list[str] = copy_images(context, image_files, io_config.output_dir)
    
    context.add_output_metadata({
        "dataset_name": io_config.dataset_name,
        "input_dir": io_config.input_dir,
        "output_dir": io_config.output_dir,
        "num_images": len(copied_image_files)
    })
    
    return copied_image_files
