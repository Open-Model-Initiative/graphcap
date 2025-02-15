# src/embedding/retrieve_router.py

from fastapi import APIRouter

# Import your service functions or classes here
from ..utils.logger import logger

router = APIRouter(prefix="/server", tags=["server"])


@router.get("/health")
async def health_check():
    logger.debug("Health check requested")
    return {"status": "healthy"}
