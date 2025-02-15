from .iptc_metadata import iptc_metadata
from .xmp_metadata import xmp_metadata

ASSETS = [iptc_metadata, xmp_metadata]
OPS = []

__all__ = ["ASSETS", "iptc_metadata", "xmp_metadata"]
