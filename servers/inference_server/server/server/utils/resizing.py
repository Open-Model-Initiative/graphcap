# SPDX-License-Identifier: Apache-2.0
"""
Image Resizing Utilities

This module provides utility functions for resizing images to standard display
and video resolutions while maintaining aspect ratio.
"""

from enum import Enum
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

from loguru import logger

try:
    from PIL import Image, ImageFile

    ImageFile.LOAD_TRUNCATED_IMAGES = True
except ImportError:
    raise ImportError("This module requires Pillow. Install it with 'pip install Pillow'.")


def log_resize_options(options: Dict[str, Any]) -> None:
    """
    Log the resize options to help with debugging.

    Args:
        options: The options dictionary containing resize settings
    """
    resize_resolution = options.get("resize_resolution")

    if resize_resolution:
        logger.info(f"Image resizing is ENABLED with resolution: {resize_resolution}")
    else:
        logger.info("Image resizing is DISABLED (no resolution specified)")


class ResolutionPreset(Enum):
    """Standard display and video resolution presets."""

    SD_VGA = (640, 480)  # Standard Definition VGA
    HD_720P = (1280, 720)  # High Definition 720p
    FHD_1080P = (1920, 1080)  # Full High Definition 1080p
    QHD_1440P = (2560, 1440)  # Quad HD 1440p
    UHD_4K = (3840, 2160)  # Ultra HD 4K
    UHD_8K = (7680, 4320)  # 8K UHD


def resize_image(
    image: Union[str, Path, Image.Image],
    resolution: Union[ResolutionPreset, Tuple[int, int]],
    maintain_aspect_ratio: bool = True,
    upscale: bool = False,
) -> Image.Image:
    """
    Resize an image to a target resolution while maintaining aspect ratio.

    Args:
        image: Path to the image file or PIL Image object
        resolution: Target resolution as ResolutionPreset enum or (width, height) tuple
        maintain_aspect_ratio: If True, preserve aspect ratio; if False, force to exact dimensions
        upscale: If True, allow upscaling of images smaller than target resolution

    Returns:
        Resized PIL Image object

    Raises:
        ValueError: If the image path is invalid or resolution is not recognized
        IOError: If there's an error opening or processing the image
    """
    # Load the image if path is provided
    if not isinstance(image, Image.Image):
        try:
            img = Image.open(str(image))
        except Exception as e:
            raise IOError(f"Failed to open image: {e}")
    else:
        img = image

    # Get target dimensions from resolution
    if isinstance(resolution, ResolutionPreset):
        target_width, target_height = resolution.value
    elif isinstance(resolution, tuple) and len(resolution) == 2:
        target_width, target_height = resolution
    else:
        raise ValueError("Resolution must be a ResolutionPreset enum or a (width, height) tuple")

    # Get original dimensions
    orig_width, orig_height = img.size

    logger.info(
        f"Resizing image: original dimensions {orig_width}x{orig_height}, target {target_width}x{target_height}"
    )

    # Skip resizing if the image is already smaller than target and upscale is False
    if not upscale and orig_width <= target_width and orig_height <= target_height:
        logger.info(
            f"Skipping resize: image {orig_width}x{orig_height} already smaller than target {target_width}x{target_height}"
        )
        return img

    if maintain_aspect_ratio:
        # Calculate aspect ratios
        target_ratio = target_width / target_height
        image_ratio = orig_width / orig_height

        if image_ratio > target_ratio:
            # Image is wider than target: fit to width
            new_width = target_width
            new_height = int(new_width / image_ratio)
        else:
            # Image is taller than target: fit to height
            new_height = target_height
            new_width = int(new_height * image_ratio)
    else:
        # Force to exact dimensions without maintaining aspect ratio
        new_width, new_height = target_width, target_height

    # Perform the resize operation
    resized_img = img.resize((new_width, new_height), Image.LANCZOS)
    logger.info(f"Image resized: original {orig_width}x{orig_height} → final {new_width}x{new_height}")

    return resized_img


def resize_to_fit_max_dimension(
    image: Union[str, Path, Image.Image], max_dimension: int, upscale: bool = False
) -> Image.Image:
    """
    Resize an image so its largest dimension does not exceed max_dimension.

    Args:
        image: Path to the image file or PIL Image object
        max_dimension: Maximum size for the largest dimension
        upscale: If True, allow upscaling of images smaller than target size

    Returns:
        Resized PIL Image object
    """
    # Load the image if path is provided
    if not isinstance(image, Image.Image):
        img = Image.open(str(image))
    else:
        img = image

    # Get original dimensions
    width, height = img.size

    logger.info(f"Resizing to max dimension: original dimensions {width}x{height}, max dimension {max_dimension}")

    # Skip if no resizing needed
    if not upscale and max(width, height) <= max_dimension:
        logger.info(f"Skipping resize: largest dimension {max(width, height)} already smaller than max {max_dimension}")
        return img

    # Calculate new dimensions
    if width >= height:
        new_width = max_dimension
        new_height = int(height * (max_dimension / width))
    else:
        new_height = max_dimension
        new_width = int(width * (max_dimension / height))

    # Perform the resize
    resized_img = img.resize((new_width, new_height), Image.LANCZOS)
    logger.info(f"Image resized: original {width}x{height} → final {new_width}x{new_height}")

    return resized_img


def save_with_quality(
    image: Image.Image,
    output_path: Union[str, Path],
    format: Optional[str] = None,
    quality: int = 90,
    optimize: bool = True,
) -> None:
    """
    Save an image with specified quality settings.

    Args:
        image: PIL Image object to save
        output_path: Path where the image should be saved
        format: Output format (e.g., 'JPEG', 'PNG'). If None, inferred from path.
        quality: Quality setting (0-100, higher is better quality)
        optimize: Whether to optimize the image
    """
    save_params = {"quality": quality, "optimize": optimize}

    # Remove quality parameter for formats that don't support it
    if format and format.upper() in ("PNG", "GIF"):
        del save_params["quality"]

    image.save(str(output_path), format=format, **save_params)
