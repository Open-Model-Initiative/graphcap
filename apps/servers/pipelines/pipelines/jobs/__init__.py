from ..perspectives import (
    JOBS as PERSPECTIVE_JOBS,
)
from .dataset_import_job import dataset_import_job
from .image_metadata import image_metadata_pipeline

JOBS = [
    *PERSPECTIVE_JOBS,
    dataset_import_job,
    image_metadata_pipeline,
]
print(JOBS)
__all__ = [
    "JOBS",
]
