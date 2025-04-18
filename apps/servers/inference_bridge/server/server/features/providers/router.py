"""
# SPDX-License-Identifier: Apache-2.0
Providers Router

Defines API routes for working with AI providers.

This module provides the following endpoints:
- POST /providers/{provider_name}/test-connection - Test connection to a provider using provided configuration
"""

import traceback

from fastapi import APIRouter
from pydantic import ValidationError

from ...utils.logger import logger
from .error_handler import (format_provider_connection_error,
                            format_provider_validation_error)
from .models import ProviderConfig
from .service import test_provider_connection

router = APIRouter(prefix="/providers", tags=["providers"])

@router.post("/{provider_name}/test-connection")
async def test_connection(provider_name: str, config: ProviderConfig):
    """
    Test connection to a provider using provided configuration.

    Args:
        provider_name: Name of the provider to test connection for
        config: Provider configuration for this request

    Returns:
        A success message if connection is successful

    Raises:
        HTTPException: If there is an error connecting to the provider
    """
    try:
        result = await test_provider_connection(provider_name, config)
        return {"status": "success", "message": "Connection successful", "result": result}
    except ValidationError as e:
        return format_provider_validation_error(e)
    except Exception as e:
        logger.error(f"Error testing connection to {provider_name}: {str(e)}")
        logger.error(traceback.format_exc())
        return format_provider_connection_error(e, provider_name, config)
