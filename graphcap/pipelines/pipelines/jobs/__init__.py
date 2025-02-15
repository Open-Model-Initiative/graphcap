from .basic import basic_caption_pipeline
from .dataset_import_job import dataset_import_job
from .image_metadata import image_metadata_pipeline
from .omi import omi_perspective_pipeline_job

JOBS = [
    omi_perspective_pipeline_job,
    basic_caption_pipeline,
    dataset_import_job,
    image_metadata_pipeline,
]
