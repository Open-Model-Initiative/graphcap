# SPDX-License-Identifier: Apache-2.0

from dagster_graphql import DagsterGraphQLClientError
from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from pydantic import BaseModel
from server.pipelines.dagster_client import DagsterClientWrapper

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobParams(BaseModel):
    job_name: str = "image_index_pipeline"


def get_dagster_client() -> DagsterClientWrapper:
    """
    Dependency function to provide a Dagster client.
    """
    return DagsterClientWrapper()  # Use default values from class


@router.post("/submit")
def submit_dagster_job(
    job_params: JobParams,
    dagster_client: DagsterClientWrapper = Depends(get_dagster_client),
) -> dict:
    """
    Submits a Dagster job execution.

    Args:
        job_params (JobParams): Parameters for the Dagster job.
        dagster_client (DagsterClientWrapper): Dagster client dependency.

    Returns:
        dict: Run ID of the submitted job.

    Raises:
        HTTPException: If there is an error submitting the job.
    """
    try:
        logger.info(f"Attempting to submit job: {job_params.job_name}")
        run_id = dagster_client.submit_job_execution(job_params.job_name)
        if not run_id:
            logger.error("No run ID returned from Dagster")
            raise HTTPException(status_code=500, detail="Failed to retrieve run ID")
        logger.info(f"Successfully submitted job with run ID: {run_id}")
        return {"run_id": run_id}
    except DagsterGraphQLClientError as e:
        logger.error(f"Dagster GraphQL error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error submitting job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
