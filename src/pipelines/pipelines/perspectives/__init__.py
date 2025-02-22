from .assets import caption_contexts, caption_output_files, perspective_caption, perspective_list, synthesizer_caption
from .jobs import (
    ASSETS as PERSPECTIVE_JOBS_ASSETS,
)
from .jobs import (
    JOBS as PERSPECTIVE_JOBS,
)
from .jobs import (
    RESOURCES as PERSPECTIVE_JOBS_RESOURCES,
)

JOBS = [
    *PERSPECTIVE_JOBS,
]

RESOURCES = [
    *PERSPECTIVE_JOBS_RESOURCES,
]

ASSETS = [
    *PERSPECTIVE_JOBS_ASSETS,
    perspective_caption,
    perspective_list,
    caption_output_files,
    caption_contexts,
    synthesizer_caption,
]
__all__ = [
    "perspective_caption",
    "perspective_list",
    "caption_output_files",
    "ASSETS",
    "caption_contexts",
    "synthesizer_caption",
    "JOBS",
    "RESOURCES",
]
