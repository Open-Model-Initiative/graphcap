# SPDX-License-Identifier: Apache-2.0

from dagster_graphql import DagsterGraphQLClient, DagsterGraphQLClientError
from server.features.repositories.types import RepositoryParams
from loguru import logger

params = RepositoryParams()


class DagsterClientWrapper:
    def __init__(self, params: RepositoryParams = RepositoryParams()):
        """
        Initialize Dagster client with host and port.

        Args:
            host (str): Dagster GraphQL host. Defaults to Docker service name.
            port (int): Dagster GraphQL port. Defaults to 32300.
        """
        logger.info(f"Initializing Dagster client with host={params.dagster_host}, port={params.dagster_port}")
        self.client = DagsterGraphQLClient(params.dagster_host, port_number=params.dagster_port)
        self.repo_location_name = params.repo_location_name
        self.repo_name = params.repo_name

    def submit_job_execution(self, job_name: str) -> str:
        """
        Submit a job execution to Dagster.

        Args:
            job_name (str): Name of the job to execute

        Returns:
            str: Run ID of the submitted job

        Raises:
            DagsterGraphQLClientError: If there's an error with the GraphQL request
        """
        logger.info(f"Submitting job execution: {job_name}")
        try:
            run_id = self.client.submit_job_execution(
                job_name,
                repository_location_name=self.repo_location_name,
                repository_name=self.repo_name,
                run_config={},
            )
            logger.info(f"Successfully submitted job. Run ID: {run_id}")
            return run_id
        except DagsterGraphQLClientError as e:
            logger.error(f"Failed to submit job {job_name}: {str(e)}")
            raise
