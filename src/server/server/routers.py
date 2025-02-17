from fastapi import APIRouter

from .features.jobs.router import router as dagster_job_router

routers = [dagster_job_router]

main_router = APIRouter()

for router in routers:
    main_router.include_router(router)

__all__ = ["main_router"]
