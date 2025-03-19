from pydantic import BaseModel


class RepositoryParams(BaseModel):
    repo_location_name: str = "pipelines.definitions"
    repo_name: str = "__repository__"
    dagster_host: str = "graphcap_pipelines"  # Docker service name for Dagster
    dagster_port: int = 32300
