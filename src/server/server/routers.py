from fastapi import APIRouter

from .features.perspectives.router import router as perspectives_router
from .features.providers.router import router as providers_router

routers = [perspectives_router, providers_router]

main_router = APIRouter()

for router in routers:
    main_router.include_router(router)

__all__ = ["main_router"]
