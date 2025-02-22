from ..perspectives import (
    JOBS as PERSPECTIVE_JOBS,
)
from .basic import basic_caption_pipeline
from .dataset_import_job import dataset_import_job
from .image_metadata import image_metadata_pipeline
from .omi import omi_perspective_pipeline_job

JOBS = [
    *PERSPECTIVE_JOBS,
    basic_caption_pipeline,
    dataset_import_job,
    image_metadata_pipeline,
]
print(JOBS)
__all__ = [
    "JOBS",
]
