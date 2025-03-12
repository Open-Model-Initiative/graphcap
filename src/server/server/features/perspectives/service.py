"""
# SPDX-License-Identifier: Apache-2.0
Perspectives Service

Provides services for working with perspective captions.
"""

import base64
import os
import tempfile
from pathlib import Path
from typing import Dict, List, Optional

import aiohttp
from fastapi import HTTPException, UploadFile
from graphcap.perspectives import (
    get_perspective,
    get_perspective_list,
)
from graphcap.providers.clients.base_client import BaseClient
from loguru import logger

from ..providers.service import get_provider_manager
from .models import PerspectiveInfo


async def download_image(url: str) -> Path:
    """
    Download an image from a URL to a temporary file.
    
    Args:
        url: URL of the image to download
        
    Returns:
        Path to the downloaded image
        
    Raises:
        HTTPException: If the image cannot be downloaded
    """
    try:
        # Create a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".jpg")
        os.close(fd)
        temp_file = Path(temp_path)

        # Download the image
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to download image from URL: {response.status}"
                    )

                content = await response.read()
                with open(temp_file, "wb") as f:
                    f.write(content)

        return temp_file
    except Exception as e:
        logger.error(f"Error downloading image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error downloading image: {str(e)}")


async def save_base64_image(base64_data: str) -> Path:
    """
    Save a base64-encoded image to a temporary file.
    
    Args:
        base64_data: Base64-encoded image data
        
    Returns:
        Path to the saved image
        
    Raises:
        HTTPException: If the image cannot be saved
    """
    try:
        # Create a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".jpg")
        os.close(fd)
        temp_file = Path(temp_path)

        # Decode and save the image
        try:
            # Handle data URLs (e.g., "data:image/jpeg;base64,...")
            if "base64," in base64_data:
                base64_data = base64_data.split("base64,")[1]

            image_data = base64.b64decode(base64_data)
            with open(temp_file, "wb") as f:
                f.write(image_data)

            return temp_file
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")
    except Exception as e:
        logger.error(f"Error saving base64 image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error saving base64 image: {str(e)}")


def get_available_perspectives() -> List[PerspectiveInfo]:
    """
    Get a list of available perspectives.
    
    Returns:
        List of perspective information
    """
    perspective_names = get_perspective_list()
    perspectives = []

    for name in perspective_names:
        try:
            perspective = get_perspective(name)
            perspectives.append(
                PerspectiveInfo(
                    name=perspective.config_name,
                    display_name=perspective.display_name,
                    version=perspective.version,
                    description="",  # Could be added to the perspective config in the future
                )
            )
        except Exception as e:
            logger.error(f"Error getting perspective {name}: {str(e)}")

    return perspectives


async def generate_caption(
    perspective_name: str,
    image_path: Path,
    max_tokens: Optional[int] = 4096,
    temperature: Optional[float] = 0.8,
    top_p: Optional[float] = 0.9,
    repetition_penalty: Optional[float] = 1.15,
    context: Optional[List[str]] = None,
    global_context: Optional[str] = None,
    provider_name: str = "gemini",
) -> Dict:
    """
    Generate a caption for an image using a perspective.
    
    Args:
        perspective_name: Name of the perspective to use
        image_path: Path to the image file
        max_tokens: Maximum number of tokens in the response
        temperature: Temperature for generation
        top_p: Top-p sampling parameter
        repetition_penalty: Repetition penalty
        context: Additional context for the caption
        global_context: Global context for the caption
        provider_name: Name of the provider to use (default: "gemini")
        
    Returns:
        Caption data
        
    Raises:
        HTTPException: If the caption cannot be generated
    """
    try:
        # Get the perspective
        perspective = get_perspective(perspective_name)

        # Get the provider client from the provider manager
        provider_manager = get_provider_manager()
        try:
            provider: BaseClient = provider_manager.get_client(provider_name)
        except ValueError as e:
            logger.error(f"Provider '{provider_name}' not found: {str(e)}")
            raise HTTPException(
                status_code=404,
                detail=f"Provider '{provider_name}' not found. Available providers: {', '.join(provider_manager.available_providers())}"
            )
        
        # Create a temporary output directory
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            
            # Generate the caption
            logger.info(f"Generating caption for {image_path} using {perspective_name} perspective and {provider_name} provider")
            
            # Check if the perspective has process_batch method
            if hasattr(perspective, "process_batch"):
                logger.info(f"Using process_batch method for {perspective_name}")
                # Use process_batch with a single image to match the pipeline implementation
                caption_data_list = await perspective.process_batch(
                    provider=provider,
                    image_paths=[image_path],
                    output_dir=output_dir,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    repetition_penalty=repetition_penalty,
                    global_context=global_context,
                    name=perspective_name
                )
                
                # Get the first (and only) result
                if not caption_data_list or len(caption_data_list) == 0:
                    logger.error(f"No caption data returned for {image_path}")
                    raise HTTPException(status_code=500, detail="No caption data returned")
                    
                caption_data = caption_data_list[0]
            else:
                # Fallback to process_single if process_batch is not available
                logger.info(f"Falling back to process_single method for {perspective_name}")
                caption_data = await perspective.process_single(
                    provider=provider,
                    image_path=image_path,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    repetition_penalty=repetition_penalty,
                    context=context,
                    global_context=global_context,
                )
            
            # Log the result
            logger.info(f"Caption generated successfully: {caption_data.keys() if caption_data else 'None'}")
            
            return caption_data
    except ValueError as e:
        logger.error(f"Error getting perspective: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating caption: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating caption: {str(e)}")


async def save_uploaded_file(file: UploadFile) -> Path:
    """
    Save an uploaded file to a temporary location.
    
    Args:
        file: Uploaded file object
        
    Returns:
        Path to the saved file
        
    Raises:
        HTTPException: If the file cannot be saved
    """
    try:
        # Create a temporary file with appropriate extension
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        fd, temp_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)
        temp_file = Path(temp_path)

        # Save the uploaded file
        content = await file.read()
        with open(temp_file, "wb") as f:
            f.write(content)

        # Reset file pointer for potential future reads
        await file.seek(0)

        return temp_file
    except Exception as e:
        logger.error(f"Error saving uploaded file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error saving uploaded file: {str(e)}")
