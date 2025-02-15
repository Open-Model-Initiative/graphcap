# image_metadata/__init__.py

"""
Image Metadata Module

This module provides Dagster assets, ops, partitions, and graphs to
extract and combine metadata (EXIF, perceptual features, semantic embeddings,
object detection, etc.) from various image types.
"""

from .common_formats import ASSETS as COMMON_FORMATS
from .extract_exif import image_list_exif_data

ASSETS = [image_list_exif_data, *COMMON_FORMATS]
OPS = []


__all__ = ["ASSETS", "image_list_exif_data"]
