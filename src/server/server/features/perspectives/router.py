"""
# SPDX-License-Identifier: Apache-2.0
Perspectives Router

Defines API routes for working with perspective captions.

This module provides the following endpoints:
- GET /perspectives/list - List all available perspectives
- POST /perspectives/caption - Generate a caption for an image using file upload
- GET /perspectives/debug/{perspective_name} - Get debug information about a perspective
- POST /perspectives/caption-from-path - Generate a caption for an image using a file path
"""

import json
import os
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile, status
from loguru import logger
from pathlib import Path

from .models import CaptionResponse, PerspectiveListResponse, CaptionPathRequest
from .service import (
    generate_caption,
    get_available_perspectives,
    save_uploaded_file,
)

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


@router.get("/debug/{perspective_name}")
async def debug_perspective(perspective_name: str) -> dict:
    """
    Get debug information about a perspective.
    
    Args:
        perspective_name: Name of the perspective to debug
        
    Returns:
        Debug information about the perspective
        
    Raises:
        HTTPException: If the perspective is not found
    """
    from graphcap.perspectives import get_perspective
    
    try:
        perspective = get_perspective(perspective_name)
        
        # Get perspective attributes
        attributes = {
            "config_name": perspective.config_name,
            "display_name": perspective.display_name,
            "version": perspective.version,
            "has_process_single": hasattr(perspective, "process_single"),
            "has_process_batch": hasattr(perspective, "process_batch"),
        }
        
        # Get method signatures if available
        if attributes["has_process_single"]:
            import inspect
            attributes["process_single_signature"] = str(inspect.signature(perspective.process_single))
            
        if attributes["has_process_batch"]:
            import inspect
            attributes["process_batch_signature"] = str(inspect.signature(perspective.process_batch))
        
        return {
            "perspective": perspective_name,
            "attributes": attributes,
            "type": str(type(perspective)),
        }
    except Exception as e:
        logger.error(f"Error getting perspective debug info: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Error getting perspective debug info: {str(e)}")


@router.post("/caption", response_model=CaptionResponse, status_code=status.HTTP_200_OK)
async def create_caption(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to upload"),
    perspective: str = Form(..., description="Name of the perspective to use"),
    provider: str = Form("gemini", description="Name of the provider to use"),
    max_tokens: Optional[int] = Form(4096, description="Maximum number of tokens"),
    temperature: Optional[float] = Form(0.8, description="Temperature for generation"),
    top_p: Optional[float] = Form(0.9, description="Top-p sampling parameter"),
    repetition_penalty: Optional[float] = Form(1.15, description="Repetition penalty"),
    global_context: Optional[str] = Form(None, description="Global context for the caption"),
    context: Optional[str] = Form(None, description="Additional context for the caption as JSON array string"),
) -> CaptionResponse:
    """
    Generate a caption for an image using a perspective.

    This endpoint supports file uploads only.

    Args:
        background_tasks: Background tasks for cleanup
        file: Image file to upload (required)
        perspective: Name of the perspective to use (required)
        provider: Name of the provider to use (optional, default: "default")
        max_tokens: Maximum number of tokens (optional, default: 4096)
        temperature: Temperature for generation (optional, default: 0.8)
        top_p: Top-p sampling parameter (optional, default: 0.9)
        repetition_penalty: Repetition penalty (optional, default: 1.15)
        context: JSON array string of context items (optional)
        global_context: Global context string (optional)

    Returns:
        Generated caption with structured result and optional raw text

    Raises:
        HTTPException: If the request is invalid or processing fails
    """
    try:
        # Parse context from JSON string if provided
        parsed_context = _parse_context(context)

        # Process the uploaded file
        image_path = await save_uploaded_file(file)

        # Add cleanup task
        background_tasks.add_task(lambda: os.unlink(image_path) if os.path.exists(image_path) else None)

        # Generate the caption
        caption_data = await generate_caption(
            perspective_name=perspective,
            image_path=image_path,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=repetition_penalty,
            context=parsed_context,
            global_context=global_context,
            provider_name=provider,
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
        # Validate the image path
        image_path = request.image_path
        
        # Log the original path for debugging
        logger.info(f"Original image path: {image_path}")
        
        # Check if the file exists directly
        if os.path.exists(image_path):
            logger.info(f"Image file exists at original path: {image_path}")
        else:
            # Try to handle workspace paths
            if image_path.startswith('/workspace/'):
                # In container, /workspace is the actual path
                logger.info(f"Path starts with /workspace/: {image_path}")
                # No need to modify the path as it should be correct in the container
            else:
                # Try to normalize the path
                if not image_path.startswith('/'):
                    image_path = f"/{image_path}"
                    logger.info(f"Added leading slash: {image_path}")
                
                # If path doesn't start with /workspace, add it
                if not image_path.startswith('/workspace/'):
                    # Check if it starts with /datasets
                    if image_path.startswith('/datasets/'):
                        image_path = f"/workspace{image_path}"
                        logger.info(f"Converted /datasets/ path to /workspace/datasets/: {image_path}")
                    else:
                        image_path = f"/workspace{image_path}"
                        logger.info(f"Added /workspace prefix: {image_path}")
                
                # Check if the file exists with the normalized path
                if not os.path.exists(image_path):
                    logger.error(f"Image file not found at normalized path: {image_path}")
                    raise HTTPException(
                        status_code=404, 
                        detail=f"Image file not found at path: {image_path}"
                    )
                else:
                    logger.info(f"Image file exists at normalized path: {image_path}")

        # Parse context from JSON string if provided
        parsed_context = None
        if request.context:
            if isinstance(request.context, list):
                parsed_context = request.context
            else:
                parsed_context = [request.context]

        # Convert string path to Path object
        image_path_obj = Path(image_path)
        logger.info(f"Final image path for caption generation: {image_path_obj}")

        # Generate the caption
        caption_data = await generate_caption(
            perspective_name=request.perspective,
            image_path=image_path_obj,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            repetition_penalty=request.repetition_penalty,
            context=parsed_context,
            global_context=request.global_context,
            provider_name=request.provider,
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
            perspective=request.perspective,
            provider=request.provider,
            result=parsed_result,
            raw_text=raw_text,
        )
    except Exception as e:
        logger.error(f"Error creating caption from path: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error creating caption from path: {str(e)}")


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
