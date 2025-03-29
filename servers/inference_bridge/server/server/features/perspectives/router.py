"""
# SPDX-License-Identifier: Apache-2.0
Perspectives Router

Defines API routes for working with perspective captions.

This module provides the following endpoints:
- GET /perspectives/list - List all available perspectives
- POST /perspectives/caption - Generate a caption for an image using file upload
- GET /perspectives/debug/{perspective_name} - Get debug information about a perspective
- POST /perspectives/caption-from-path - Generate a caption for an image using a file path
- GET /perspectives/modules - List all available perspective modules
- GET /perspectives/modules/{module_name} - Get perspectives for a specific module
"""

import json
import os
import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import (APIRouter, BackgroundTasks, File, Form, HTTPException,
                     UploadFile, status)
from loguru import logger

from ...utils.resizing import (ResolutionPreset, log_resize_options,
                               resize_image)
from .models import (CaptionPathRequest, CaptionResponse, ModuleListResponse,
                     ModulePerspectivesResponse, PerspectiveListResponse)
from .service import (generate_caption, get_available_modules,
                      get_available_perspectives, get_perspectives_by_module,
                      save_uploaded_file)

router = APIRouter(prefix="/perspectives", tags=["perspectives"])


@router.get("/list", response_model=PerspectiveListResponse)
async def list_perspectives() -> PerspectiveListResponse:
    """
    List all available perspectives.

    Returns:
        List of available perspectives
    """
    perspectives = get_available_perspectives()
    return PerspectiveListResponse(perspectives=perspectives)


@router.post("/caption", response_model=CaptionResponse, status_code=status.HTTP_200_OK)
async def create_caption(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to upload"),
    perspective: str = Form(..., description="Name of the perspective to use"),
    provider: str = Form(..., description="Name of the provider to use"),
    provider_config: str = Form(..., description="Provider configuration as JSON string"),
    model: str = Form(..., description="Model name to use for processing"),
    max_tokens: Optional[int] = Form(4096, description="Maximum number of tokens"),
    temperature: Optional[float] = Form(0.8, description="Temperature for generation"),
    top_p: Optional[float] = Form(0.9, description="Top-p sampling parameter"),
    repetition_penalty: Optional[float] = Form(1.15, description="Repetition penalty"),
    global_context: Optional[str] = Form(None, description="Global context for the caption"),
    context: Optional[str] = Form(None, description="Additional context for the caption as JSON array string"),
    resize_resolution: Optional[str] = Form(None, description="Resolution to resize to (None to disable resizing)"),
) -> CaptionResponse:
    """
    Generate a caption for an image using a perspective.

    This endpoint supports file uploads only.

    Args:
        background_tasks: Background tasks for cleanup
        file: Image file to upload (required)
        perspective: Name of the perspective to use (required)
        provider: Name of the provider to use (required)
        provider_config: Provider configuration as JSON string (required)
        model: Model name to use for processing (required)
        max_tokens: Maximum number of tokens (optional, default: 4096)
        temperature: Temperature for generation (optional, default: 0.8)
        top_p: Top-p sampling parameter (optional, default: 0.9)
        repetition_penalty: Repetition penalty (optional, default: 1.15)
        context: JSON array string of context items (optional)
        global_context: Global context string (optional)
        resize_resolution: Resolution to resize to (optional, default: None - no resizing)

    Returns:
        Generated caption with structured result and optional raw text

    Raises:
        HTTPException: If the request is invalid or processing fails
    """
    try:
        # Parse context from JSON string if provided
        parsed_context = _parse_context(context)

        # Parse provider_config from JSON string if provided
        try:
            parsed_provider_config = json.loads(provider_config)
            logger.info(f"Parsed provider configuration for {provider}")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid provider configuration JSON: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid provider configuration JSON: {str(e)}")

        # Process the uploaded file
        image_path = await save_uploaded_file(file)

        # Log resize options
        options = {"resize_resolution": resize_resolution}
        log_resize_options(options)

        # Resize the image if resize_resolution is provided
        if resize_resolution:
            try:
                # Get the resolution enum value
                try:
                    resolution = ResolutionPreset[resize_resolution]
                except (KeyError, ValueError):
                    logger.warning(f"Invalid resolution: {resize_resolution}. Skipping resize.")
                    # Skip resizing and continue with original image
                    continue_resize = False
                else:
                    continue_resize = True
                
                if continue_resize:
                    # Create temporary file for resized image
                    suffix = os.path.splitext(image_path)[1]
                    fd, resized_path = tempfile.mkstemp(suffix=suffix)
                    os.close(fd)

                    # Resize the image
                    logger.info(f"Resizing image to {resolution.name} ({resolution.value})")
                    resized_img = resize_image(image_path, resolution)
                    resized_img.save(resized_path)

                    # Add cleanup task for original image
                    background_tasks.add_task(lambda: os.unlink(image_path) if os.path.exists(image_path) else None)

                    # Use the resized image
                    image_path = Path(resized_path)
                    logger.info(f"Image resized successfully to {resolution.name}")
            except Exception as e:
                logger.error(f"Error resizing image: {str(e)}")
                logger.warning("Using original image instead")
                # Continue with original image if resizing fails

        # Add cleanup task
        background_tasks.add_task(lambda: os.unlink(image_path) if os.path.exists(image_path) else None)

        # Validate provider configuration
        if not parsed_provider_config:
            logger.error(f"No provider configuration provided for {provider}")
            raise HTTPException(
                status_code=400,
                detail=f"Provider configuration not provided for '{provider}'. Please include provider_config in the request."
            )

        # Validate model is provided
        if not model:
            logger.error(f"No model specified for {provider}")
            raise HTTPException(
                status_code=400,
                detail=f"Model name not provided for '{provider}'. Please include model in the request."
            )

        # Generate the caption
        caption_data = await generate_caption(
            perspective_name=perspective,
            image_path=image_path,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=repetition_penalty,
            context=parsed_context,
            global_context=global_context,
            provider_name=provider,
            provider_config=parsed_provider_config,
        )

        # Log the caption data for debugging
        logger.debug(f"Caption data: {caption_data}")

        # Extract the parsed result and raw text
        parsed_result = caption_data.get("parsed", {})
        raw_text = caption_data.get("raw_text")

        # If parsed result is empty but raw_text exists, try to create a basic result
        if not parsed_result and raw_text:
            logger.warning("Parsed result is empty but raw_text exists. Creating basic result.")
            parsed_result = {"text": raw_text}

        # Return the response
        return CaptionResponse(
            perspective=perspective,
            provider=provider,
            result=parsed_result,
            raw_text=raw_text,
        )
    except Exception as e:
        logger.error(f"Error creating caption: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error creating caption: {str(e)}")


@router.post("/caption-from-path", response_model=CaptionResponse, status_code=status.HTTP_200_OK)
async def create_caption_from_path(
    request: CaptionPathRequest,
) -> CaptionResponse:
    """
    Generate a caption for an image using a perspective and a file path.

    This endpoint supports providing a path to an image in the workspace.

    Args:
        request: Caption request with image path and perspective settings

    Returns:
        Generated caption with structured result and optional raw text

    Raises:
        HTTPException: If the request is invalid or processing fails
    """
    try:
        # Create Path object from image path and validate
        image_path = _validate_image_path(request.image_path)
        temp_path = None

        # Handle image resizing if requested
        image_path, temp_path = await _resize_image_if_needed(image_path, request.resize_resolution)

        # Process context
        context = _process_context(request.context)

        # Validate that provider_config is present
        if not hasattr(request, 'provider_config') or not request.provider_config:
            logger.error(f"No provider configuration provided for {request.provider}")
            raise HTTPException(
                status_code=400,
                detail=f"Provider configuration not provided for '{request.provider}'. Please include provider_config in the request."
            )

        # Validate that model is provided
        if not hasattr(request, 'model') or not request.model:
            logger.error(f"No model specified for {request.provider}")
            raise HTTPException(
                status_code=400,
                detail=f"Model name not provided for '{request.provider}'. Please include model in the request."
            )

        # Generate the caption
        caption_data = await generate_caption(
            perspective_name=request.perspective,
            image_path=image_path,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            repetition_penalty=request.repetition_penalty,
            context=context,
            global_context=request.global_context,
            provider_name=request.provider,
            provider_config=request.provider_config,
        )

        # Clean up temporary file if we created one
        _cleanup_temp_file(temp_path)

        # Prepare the response
        return _prepare_caption_response(caption_data, request.perspective, request.provider)
    except Exception as e:
        logger.error(f"Error creating caption from path: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error creating caption from path: {str(e)}")


def _validate_image_path(image_path_str: str) -> Path:
    """Validate that the image path exists."""
    image_path = Path(image_path_str)
    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image file not found: {image_path}")
    return image_path


async def _resize_image_if_needed(image_path: Path, resize_resolution: Optional[str]) -> tuple[Path, Optional[Path]]:
    """Resize the image if a resize resolution is provided."""
    temp_path = None

    # Log resize options
    options = {"resize_resolution": resize_resolution}
    log_resize_options(options)

    if not resize_resolution:
        return image_path, temp_path

    try:
        # Get the resolution enum value
        try:
            resolution = ResolutionPreset[resize_resolution]
        except (KeyError, ValueError):
            logger.warning(f"Invalid resolution: {resize_resolution}. Skipping resize.")
            return image_path, temp_path
        
        # Create temporary file for resized image
        suffix = os.path.splitext(str(image_path))[1]
        fd, resized_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)
        temp_path = Path(resized_path)

        # Resize the image
        logger.info(f"Resizing image to {resolution.name} ({resolution.value})")
        resized_img = resize_image(image_path, resolution)
        resized_img.save(resized_path)

        # Use the resized image
        logger.info(f"Image resized successfully to {resolution.name}")
        return temp_path, temp_path
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        logger.warning("Using original image instead")
        # Continue with original image if resizing fails
        return image_path, temp_path


def _process_context(context_input) -> Optional[List[str]]:
    """Process and normalize context input to a list of strings."""
    if not context_input:
        return None

    if not isinstance(context_input, str):
        return context_input

    # Try to parse as JSON first
    try:
        parsed_context = json.loads(context_input)
        # If it's a list, use it directly
        if isinstance(parsed_context, list):
            return parsed_context
        # If not a list, wrap in a list
        return [context_input]
    except json.JSONDecodeError:
        # If not valid JSON, treat as a single string
        return [context_input]


def _cleanup_temp_file(temp_path: Optional[Path]) -> None:
    """Clean up temporary file if it exists."""
    if temp_path and temp_path.exists():
        try:
            os.unlink(temp_path)
        except Exception as e:
            logger.error(f"Error removing temporary file: {str(e)}")


def _prepare_caption_response(caption_data: dict, perspective: str, provider: str) -> CaptionResponse:
    """Prepare the caption response from the caption data."""
    # Log the caption data for debugging
    logger.debug(f"Caption data: {caption_data}")

    # Extract the parsed result and raw text
    parsed_result = caption_data.get("parsed", {})
    raw_text = caption_data.get("raw_text")

    # If parsed result is empty but raw_text exists, create a basic result
    if not parsed_result and raw_text:
        logger.warning("Parsed result is empty but raw_text exists. Creating basic result.")
        parsed_result = {"text": raw_text}

    # Return the response
    return CaptionResponse(
        perspective=perspective,
        provider=provider,
        result=parsed_result,
        raw_text=raw_text,
    )


def _parse_context(context_str) -> Optional[List[str]]:
    """Parse context from a JSON string."""
    if not context_str or not isinstance(context_str, str):
        return None

    try:
        context = json.loads(context_str)
        if isinstance(context, list):
            return context
        return [context_str]
    except json.JSONDecodeError:
        return [context_str]




@router.get("/modules", response_model=ModuleListResponse)
async def list_modules() -> ModuleListResponse:
    """
    List all available perspective modules.

    Returns:
        List of available modules with metadata
    """
    modules = get_available_modules()
    return ModuleListResponse(modules=modules)


@router.get("/modules/{module_name}", response_model=ModulePerspectivesResponse)
async def get_module_perspectives(module_name: str) -> ModulePerspectivesResponse:
    """
    Get all perspectives that belong to a specific module.

    Args:
        module_name: Name of the module to get perspectives for

    Returns:
        Module information and list of perspectives in the module
    
    Raises:
        HTTPException: If the module is not found
    """
    try:
        # Get perspectives for the module
        perspectives = get_perspectives_by_module(module_name)
        
        # Get module info
        modules = get_available_modules()
        module = next((m for m in modules if m.name == module_name), None)
        
        if not module:
            raise HTTPException(status_code=404, detail=f"Module '{module_name}' not found")
        
        return ModulePerspectivesResponse(
            module=module,
            perspectives=perspectives
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error getting perspectives for module '{module_name}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting perspectives for module '{module_name}': {str(e)}"
        )
