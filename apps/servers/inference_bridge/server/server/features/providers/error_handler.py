"""
# SPDX-License-Identifier: Apache-2.0
Provider Error Handler

Handles provider-specific error formatting and responses.
"""

import datetime
from typing import Any, Dict, Set

from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .models import ProviderConfig


def _extract_invalid_fields(errors) -> Set[str]:
    """Extract the set of invalid field names from validation errors."""
    invalid_fields: Set[str] = set()
    
    for error in errors:
        loc = error.get("loc", [])
        if len(loc) > 1:
            field_name = loc[1] if isinstance(loc[1], str) else str(loc[1])
            invalid_fields.add(field_name)
            
    return invalid_fields


def _build_invalid_params(errors) -> Dict[str, Dict]:
    """Build dictionary mapping fields to their error details."""
    invalid_params = {}
    
    for error in errors:
        # Get field location
        loc = error.get("loc", [])
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
            
    return invalid_params


def _generate_error_message(invalid_fields: Set[str]) -> str:
    """Generate an appropriate error message based on invalid fields."""
    if len(invalid_fields) == 1:
        field = next(iter(invalid_fields))
        return f"Invalid provider configuration: '{field}' parameter is invalid"
    elif len(invalid_fields) > 1:
        field_list = "', '".join(sorted(invalid_fields))
        return f"Invalid provider configuration: Parameters '{field_list}' are invalid"
    else:
        return "Invalid provider configuration"


def _get_field_from_error(error: dict) -> str:
    """Extract the field name from the error location."""
    return ".".join(str(loc) for loc in error.get("loc", [])[1:]) if error.get("loc") else ""


def _add_error_type_suggestion(error: dict, field: str, suggestions: list) -> None:
    """Add suggestion based on error type."""
    error_type = error.get("type", "")
    
    if error_type == "missing":
        suggestions.append(f"Add the missing required parameter: '{field}'")
    elif error_type == "string_type":
        suggestions.append(f"Ensure '{field}' is a valid string")
    elif error_type == "url_parsing":
        suggestions.append(f"Use a valid URL format for '{field}'")
    elif error_type and "enum" in error_type:
        _add_enum_suggestion(error, field, suggestions)


def _add_enum_suggestion(error: dict, field: str, suggestions: list) -> None:
    """Add suggestion for enum validation errors."""
    valid_values = error.get("ctx", {}).get("expected", [])
    if valid_values:
        values_str = ", ".join([f"'{v}'" for v in valid_values])
        suggestions.append(f"Choose a valid option for '{field}': {values_str}")
    else:
        suggestions.append(f"Choose a valid option for '{field}'")


def _add_field_specific_suggestion(field: str, suggestions: list) -> None:
    """Add suggestion based on specific field name."""
    if field == "api_key":
        suggestions.append("Check the API key is correct for this provider")
    elif field == "base_url":
        suggestions.append("Verify the base URL format matches the provider's API documentation")
    elif field == "environment":
        suggestions.append("Valid environment values are typically 'cloud' or 'local'")


def _generate_suggestions(errors) -> list:
    """Generate helpful suggestions based on validation errors."""
    suggestions = ["Check API key and endpoint URL", "Verify the provider is correctly configured"]
    
    for error in errors:
        field = _get_field_from_error(error)
        _add_error_type_suggestion(error, field, suggestions)
        _add_field_specific_suggestion(field, suggestions)
    
    suggestions.append("Check server logs for more details")
    return list(dict.fromkeys(suggestions))  # Remove duplicates while preserving order


def format_provider_validation_error(e: ValidationError) -> JSONResponse:
    """
    Format a provider validation error into a standardized response.
    
    Args:
        e: The validation error
        
    Returns:
        A JSONResponse with detailed error information
    """
    errors = e.errors()
    
    # Extract field names and build error details
    invalid_fields = _extract_invalid_fields(errors)
    invalid_params = _build_invalid_params(errors)
    
    # Generate appropriate message and suggestions
    message = _generate_error_message(invalid_fields)
    suggestions = _generate_suggestions(errors)
    
    # Build the response
    error_response = {
        "title": "Connection failed",
        "timestamp": datetime.datetime.now().isoformat(),
        "message": message,
        "name": "Error",
        "details": "The server rejected the request due to invalid provider parameters.",
        "invalid_parameters": invalid_params,
        "suggestions": suggestions
    }
    
    return JSONResponse(
        status_code=400,
        content=error_response
    )


def _create_safe_config(config: ProviderConfig) -> Dict[str, Any]:
    """Create a copy of the config without sensitive information."""
    return {
        "kind": config.kind,
        "environment": config.environment,
        "base_url": config.base_url,
        "models": config.models,
        "fetch_models": config.fetch_models,
    }


def _determine_error_code(error_message: str) -> str:
    """Determine the error code based on the error message."""
    error_message = error_message.lower()
    
    if "authentication failed" in error_message or "unauthorized" in error_message:
        return "AUTH_ERROR"
    elif "not found" in error_message or "404" in error_message:
        return "ENDPOINT_NOT_FOUND"
    elif "timeout" in error_message:
        return "TIMEOUT"
    elif "connection" in error_message:
        return "CONNECTION_ERROR"
    elif "rate limit" in error_message or "too many requests" in error_message:
        return "RATE_LIMIT"
    elif "quota" in error_message or "exceeded" in error_message:
        return "QUOTA_EXCEEDED"
    else:
        return "UNKNOWN_ERROR"


def _generate_connection_suggestions(error_code: str) -> list:
    """Generate suggestions based on the error code."""
    suggestions = ["Check API key and endpoint URL", "Verify the provider is correctly configured"]
    
    if error_code == "AUTH_ERROR":
        suggestions.append("Check if the API key is valid and has the necessary permissions")
    elif error_code == "ENDPOINT_NOT_FOUND":
        suggestions.append("Verify the base URL is correct for this provider")
    elif error_code == "TIMEOUT":
        suggestions.append("The server took too long to respond. Check network connectivity or try again later")
    elif error_code == "CONNECTION_ERROR":
        suggestions.append("Failed to establish connection to the provider. Check network connectivity")
    elif error_code == "RATE_LIMIT":
        suggestions.append("You've exceeded the provider's rate limits. Try again later")
    elif error_code == "QUOTA_EXCEEDED":
        suggestions.append("You've exceeded your provider quota. Check your usage dashboard")
    
    suggestions.append("Check server logs for more details")
    return suggestions


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
    # Get the error message as string
    error_message = str(e)
    
    # Determine error code
    error_code = _determine_error_code(error_message)
    
    # Create safe configuration without sensitive data
    safe_config = _create_safe_config(config)
    
    # Generate provider details
    provider_details = {
        "provider": provider_name,
        "error_type": type(e).__name__,
        "error_code": error_code,
        "config": safe_config
    }
    
    # Generate suggestions
    suggestions = _generate_connection_suggestions(error_code)
    
    # Create the error response
    error_response = {
        "title": "Connection failed",
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "error",
        "message": error_message,
        "name": "Error",
        "details": "Failed to connect to the provider service.",
        "provider_details": provider_details,
        "suggestions": suggestions
    }
    
    # Return a structured error response with HTTP 400 status
    return JSONResponse(
        status_code=400,
        content=error_response
    )
