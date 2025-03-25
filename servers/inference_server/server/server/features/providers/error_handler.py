"""
# SPDX-License-Identifier: Apache-2.0
Provider Error Handler

Handles provider-specific error formatting and responses.
"""

import datetime
import traceback
from typing import Any, Dict, List, Set, Union

from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .models import ProviderConfig
from ...utils.logger import logger


def format_provider_validation_error(e: ValidationError, provider_name: str) -> JSONResponse:
    """
    Format a provider validation error into a standardized response.
    
    Args:
        e: The validation error
        provider_name: Name of the provider
        
    Returns:
        A JSONResponse with detailed error information
    """
    errors = e.errors()
    invalid_params = {}
    
    # Extract field names for the error message
    invalid_fields: Set[str] = set()
    
    for error in errors:
        # Get field location
        loc = error.get("loc", [])
        if len(loc) > 1:
            field_name = loc[1] if isinstance(loc[1], str) else str(loc[1])
            invalid_fields.add(field_name)
            
        # Format specific error details
        field = ".".join(str(loc) for loc in error.get("loc", [])) if error.get("loc") else ""
        message = error.get("msg", "Validation error")
        error_type = error.get("type", "unknown_error")
        
        # Add context if available
        context = {}
        if error.get("ctx"):
            for key, value in error.get("ctx", {}).items():
                if key != "expected" or not isinstance(value, list) or len(value) < 5:
                    context[key] = value
        
        invalid_params[field] = {
            "message": message,
            "error_type": error_type
        }
        
        if context:
            invalid_params[field]["context"] = context
    
    # Generate appropriate overall message
    if len(invalid_fields) == 1:
        field = next(iter(invalid_fields))
        message = f"Invalid provider configuration: '{field}' parameter is invalid"
    elif len(invalid_fields) > 1:
        field_list = "', '".join(sorted(invalid_fields))
        message = f"Invalid provider configuration: Parameters '{field_list}' are invalid"
    else:
        message = "Invalid provider configuration"
    
    # Build provider-specific suggestions
    suggestions = ["Check API key and endpoint URL", "Verify the provider is correctly configured"]
    
    for error in errors:
        error_type = error.get("type", "")
        field = ".".join(str(loc) for loc in error.get("loc", [])[1:]) if error.get("loc") else ""
        
        if error_type == "missing":
            suggestions.append(f"Add the missing required parameter: '{field}'")
        elif error_type == "string_type":
            suggestions.append(f"Ensure '{field}' is a valid string")
        elif error_type == "url_parsing":
            suggestions.append(f"Use a valid URL format for '{field}'")
        elif error_type and "enum" in error_type:
            valid_values = error.get("ctx", {}).get("expected", [])
            if valid_values:
                values_str = ", ".join([f"'{v}'" for v in valid_values])
                suggestions.append(f"Choose a valid option for '{field}': {values_str}")
            else:
                suggestions.append(f"Choose a valid option for '{field}'")
        
        # Add provider-specific field suggestions
        if field == "api_key":
            suggestions.append("Check the API key is correct for this provider")
        elif field == "base_url":
            suggestions.append("Verify the base URL format matches the provider's API documentation")
        elif field == "environment":
            suggestions.append("Valid environment values are typically 'cloud' or 'local'")
    
    suggestions.append("Check server logs for more details")
    
    # Build the response
    error_response = {
        "title": "Connection failed",
        "timestamp": datetime.datetime.now().isoformat(),
        "message": message,
        "name": "Error",
        "details": "The server rejected the request due to invalid provider parameters.",
        "invalid_parameters": invalid_params,
        "suggestions": list(dict.fromkeys(suggestions))
    }
    
    return JSONResponse(
        status_code=400,
        content=error_response
    )


def format_provider_connection_error(e: Exception, provider_name: str, config: ProviderConfig) -> JSONResponse:
    """
    Format a provider connection error into a standardized response.
    
    Args:
        e: The exception that occurred
        provider_name: Name of the provider
        config: The provider configuration
        
    Returns:
        A JSONResponse with detailed error information
    """
    # Create a detailed error response
    error_response: Dict[str, Any] = {
        "title": "Connection failed",
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "error",
        "message": str(e),
        "name": "Error",
        "details": "Failed to connect to the provider service.",
        "provider_details": {
            "provider": provider_name,
            "error_type": type(e).__name__,
        }
    }
    
    # Add any configuration info that might be helpful for debugging
    # but exclude sensitive data like API keys
    safe_config = {
        "kind": config.kind,
        "environment": config.environment,
        "base_url": config.base_url,
        "default_model": config.default_model,
        "models": config.models,
        "fetch_models": config.fetch_models,
    }
    error_response["provider_details"]["config"] = safe_config
    
    # Create specific suggestions for common issues
    suggestions = ["Check API key and endpoint URL", "Verify the provider is correctly configured"]
    
    if "authentication failed" in str(e).lower() or "unauthorized" in str(e).lower():
        error_response["provider_details"]["error_code"] = "AUTH_ERROR"
        suggestions.append("Check if the API key is valid and has the necessary permissions")
    elif "not found" in str(e).lower() or "404" in str(e).lower():
        error_response["provider_details"]["error_code"] = "ENDPOINT_NOT_FOUND"
        suggestions.append("Verify the base URL is correct for this provider")
    elif "timeout" in str(e).lower():
        error_response["provider_details"]["error_code"] = "TIMEOUT"
        suggestions.append("The server took too long to respond. Check network connectivity or try again later")
    elif "connection" in str(e).lower():
        error_response["provider_details"]["error_code"] = "CONNECTION_ERROR"
        suggestions.append("Failed to establish connection to the provider. Check network connectivity")
    elif "rate limit" in str(e).lower() or "too many requests" in str(e).lower():
        error_response["provider_details"]["error_code"] = "RATE_LIMIT"
        suggestions.append("You've exceeded the provider's rate limits. Try again later")
    elif "quota" in str(e).lower() or "exceeded" in str(e).lower():
        error_response["provider_details"]["error_code"] = "QUOTA_EXCEEDED"
        suggestions.append("You've exceeded your provider quota. Check your usage dashboard")
    else:
        error_response["provider_details"]["error_code"] = "UNKNOWN_ERROR"
        
    suggestions.append("Check server logs for more details")
    error_response["suggestions"] = suggestions
        
    # Return a structured error response with HTTP 400 status
    return JSONResponse(
        status_code=400,
        content=error_response
    ) 