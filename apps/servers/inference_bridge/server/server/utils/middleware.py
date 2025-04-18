"""
# SPDX-License-Identifier: Apache-2.0
Middleware for FastAPI

Contains middleware components for the FastAPI application.
"""

import datetime
import json
from typing import Any, Callable, Dict, List, Optional, Sequence, Union
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from ..utils.logger import logger


class ValidationErrorMiddleware:
    """
    Middleware for handling validation errors and providing detailed error messages.
    
    This middleware intercepts RequestValidationError exceptions and transforms them
    into user-friendly error responses with specific details about what parameters
    were invalid.
    """
    
    def __init__(self, app: FastAPI):
        """Initialize the middleware with the FastAPI app."""
        self.app = app
        
        # Register the exception handler
        @app.exception_handler(RequestValidationError)
        async def validation_exception_handler(request: Request, exc: RequestValidationError):
            return self.handle_validation_error(request, exc)
        
        # Register the pydantic ValidationError handler
        @app.exception_handler(ValidationError)
        async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
            return self.handle_validation_error(request, exc)
    
    def handle_validation_error(self, request: Request, exc: Union[RequestValidationError, ValidationError]):
        """
        Handle validation errors and transform them into detailed error responses.
        
        Args:
            request: The FastAPI request
            exc: The validation exception
            
        Returns:
            JSONResponse: A detailed error response
        """
        # Extract error details from the exception
        errors = exc.errors()
        
        # Log the error
        logger.error(f"Validation error: {errors}")
        
        # Generate an overall message about the invalid parameters
        message = self._generate_overall_message(errors)
        
        # Generate suggestions based on error types
        suggestions = self._generate_suggestions(errors)
        
        # Generate field-specific error details
        invalid_params = self._format_error_details(errors)
        
        # Build the response
        error_response = {
            "title": "Validation Error",
            "timestamp": datetime.datetime.now().isoformat(),
            "message": message,
            "name": "Error",
            "details": "The request was rejected due to invalid parameters.",
            "invalid_parameters": invalid_params,
            "suggestions": suggestions
        }
        
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response
        )
    
    def _generate_overall_message(self, errors: Sequence[Dict[str, Any]]) -> str:
        """
        Generate a clear overall error message summarizing what's invalid.
        
        Args:
            errors: List of error dictionaries
            
        Returns:
            A summary message string
        """
        # Start with a default message
        if not errors:
            return "Invalid request parameters"
            
        # Count how many fields have errors
        invalid_fields = set()
        for error in errors:
            loc = error.get("loc", [])
            if len(loc) > 1:  # Skip the body/query prefix
                field_name = loc[1] if isinstance(loc[1], str) else str(loc[1])
                invalid_fields.add(field_name)
        
        if len(invalid_fields) == 1:
            field = next(iter(invalid_fields))
            return f"Invalid request: '{field}' parameter is invalid"
        elif len(invalid_fields) > 1:
            field_list = "', '".join(sorted(invalid_fields))
            return f"Invalid request: Parameters '{field_list}' are invalid"
        else:
            return "Invalid request parameters"
    
    def _generate_suggestions(self, errors: Sequence[Dict[str, Any]]) -> List[str]:
        """
        Generate helpful suggestions based on error types.
        
        Args:
            errors: List of error dictionaries
            
        Returns:
            List of suggestion strings
        """
        suggestions = []
        
        # Add specific suggestions based on error types
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
            elif error_type == "value_error":
                suggestions.append(f"Provide a valid value for '{field}'")
            elif error_type == "type_error":
                suggestions.append(f"Check the data type for '{field}'")
                
        # Add generic suggestion at the end
        suggestions.append("Check the documentation for correct parameter formats")
        
        # Return unique suggestions
        return list(dict.fromkeys(suggestions))
    
    def _format_error_details(self, errors: Sequence[Dict[str, Any]]) -> Dict[str, Dict[str, str]]:
        """
        Format validation errors into a structured dictionary.
        
        Args:
            errors: List of error dictionaries
            
        Returns:
            Dictionary of field names to error details
        """
        invalid_params = {}
        
        for error in errors:
            # Extract location (field name)
            location = error.get("loc", [])
            if len(location) < 2:
                continue
                
            # Skip the first element (usually 'body' or 'query')
            field_path = ".".join(str(loc) for loc in location[1:])
            
            # Extract error message and type
            message = error.get("msg", "Validation error")
            error_type = error.get("type", "unknown_error")
            
            # Add any context information from the error
            context = {}
            if error.get("ctx"):
                for key, value in error.get("ctx", {}).items():
                    if key != "expected" or not isinstance(value, list) or len(value) < 5:
                        context[key] = value
            
            invalid_params[field_path] = {
                "message": message,
                "error_type": error_type
            }
            
            # Add context if available
            if context:
                invalid_params[field_path]["context"] = context
            
        return invalid_params


def setup_middlewares(app: FastAPI) -> None:
    """
    Set up all middleware for the FastAPI application.
    
    Args:
        app: The FastAPI application instance
    """
    # Initialize the validation error middleware
    ValidationErrorMiddleware(app) 