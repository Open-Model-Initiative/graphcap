"""
# SPDX-License-Identifier: Apache-2.0
Perspectives API Models

Defines data models for the perspectives API endpoints.
"""

from enum import Enum
from typing import Dict, List, Optional, Union, Any

from fastapi import UploadFile, Form, File
from pydantic import BaseModel, Field, create_model

from ..providers.models import ProviderInfo


class SchemaField(BaseModel):
    """Schema field information for a perspective."""

    name: str = Field(..., description="Name of the field")
    type: str = Field(..., description="Type of the field (str, float)")
    description: str = Field(..., description="Description of the field")
    is_list: bool = Field(False, description="Whether the field is a list")
    is_complex: bool = Field(False, description="Whether the field is a complex type")
    fields: Optional[List['SchemaField']] = Field(None, description="Fields for complex types")


class TableColumn(BaseModel):
    """Table column information for a perspective."""

    name: str = Field(..., description="Name of the column")
    style: str = Field(..., description="Style of the column")


class PerspectiveSchema(BaseModel):
    """Schema information for a perspective."""

    name: str = Field(..., description="Name of the schema")
    display_name: str = Field(..., description="Display name of the schema")
    version: str = Field(..., description="Version of the schema")
    prompt: str = Field(..., description="Prompt template for the perspective")
    schema_fields: List[SchemaField] = Field(..., description="Fields in the schema")
    table_columns: List[TableColumn] = Field(..., description="Table columns for display")
    context_template: str = Field(..., description="Template for context generation")


class PerspectiveInfo(BaseModel):
    """Information about a perspective."""

    name: str = Field(..., description="Unique identifier for the perspective")
    display_name: str = Field(..., description="Human-readable name for the perspective")
    version: str = Field(..., description="Version of the perspective")
    description: str = Field("", description="Description of what the perspective analyzes")
    schema: Optional[PerspectiveSchema] = Field(None, description="Schema information for the perspective")


class PerspectiveListResponse(BaseModel):
    """Response model for listing available perspectives."""

    perspectives: List[PerspectiveInfo] = Field(..., description="List of available perspectives")


class ImageSource(BaseModel):
    """Source of an image for captioning."""

    url: Optional[str] = Field(None, description="URL of the image to caption")
    base64: Optional[str] = Field(None, description="Base64-encoded image data")
    
    class Config:
        schema_extra = {
            "example": {
                "url": "https://example.com/image.jpg"
            }
        }


class CaptionRequest(BaseModel):
    """Request model for generating a caption with a perspective."""

    perspective: str = Field(..., description="Name of the perspective to use")
    image: ImageSource = Field(..., description="Image to caption")
    max_tokens: Optional[int] = Field(4096, description="Maximum number of tokens in the response")
    temperature: Optional[float] = Field(0.8, description="Temperature for generation")
    top_p: Optional[float] = Field(0.9, description="Top-p sampling parameter")
    repetition_penalty: Optional[float] = Field(1.15, description="Repetition penalty")
    context: Optional[List[str]] = Field(None, description="Additional context for the caption")
    global_context: Optional[str] = Field(None, description="Global context for the caption")
    
    class Config:
        schema_extra = {
            "example": {
                "perspective": "custom_caption",
                "image": {
                    "url": "https://example.com/image.jpg"
                },
                "max_tokens": 4096,
                "temperature": 0.8
            }
        }


class CaptionResponse(BaseModel):
    """Response model for a generated caption."""

    perspective: str = Field(..., description="Name of the perspective used")
    provider: str = Field("gemini", description="Name of the provider used")
    result: Dict = Field(..., description="Structured caption result")
    raw_text: Optional[str] = Field(None, description="Raw text response from the model")


# Form data model for multipart/form-data requests with file uploads
class CaptionFormRequest:
    """Form request model for generating a caption with a perspective using file upload."""
    
    def __init__(
        self,
        perspective: str = Form(..., description="Name of the perspective to use"),
        file: Optional[UploadFile] = File(None, description="Image file to caption"),
        url: Optional[str] = Form(None, description="URL of the image to caption"),
        base64: Optional[str] = Form(None, description="Base64-encoded image data"),
        max_tokens: Optional[int] = Form(4096, description="Maximum number of tokens in the response"),
        temperature: Optional[float] = Form(0.8, description="Temperature for generation"),
        top_p: Optional[float] = Form(0.9, description="Top-p sampling parameter"),
        repetition_penalty: Optional[float] = Form(1.15, description="Repetition penalty"),
        global_context: Optional[str] = Form(None, description="Global context for the caption"),
        context: Optional[str] = Form(None, description="Additional context for the caption (JSON array string)")
    ):
        self.perspective = perspective
        self.file = file
        self.url = url
        self.base64 = base64
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        self.repetition_penalty = repetition_penalty
        self.global_context = global_context
        
        # Parse context from JSON string if provided
        self.context = None
        if context:
            import json
            try:
                self.context = json.loads(context)
            except json.JSONDecodeError:
                # If not valid JSON array, treat as a single context item
                self.context = [context]


class CaptionPathRequest(BaseModel):
    """Request model for generating a caption with a perspective using a file path."""

    perspective: str = Field(..., description="Name of the perspective to use")
    image_path: str = Field(..., description="Path to the image file in the workspace")
    provider: str = Field("gemini", description="Name of the provider to use")
    max_tokens: Optional[int] = Field(4096, description="Maximum number of tokens in the response")
    temperature: Optional[float] = Field(0.8, description="Temperature for generation")
    top_p: Optional[float] = Field(0.9, description="Top-p sampling parameter")
    repetition_penalty: Optional[float] = Field(1.15, description="Repetition penalty")
    context: Optional[Union[List[str], str]] = Field(None, description="Additional context for the caption")
    global_context: Optional[str] = Field(None, description="Global context for the caption")
    
    class Config:
        schema_extra = {
            "example": {
                "perspective": "custom_caption",
                "image_path": "/workspace/datasets/example.jpg",
                "provider": "gemini",
                "max_tokens": 4096,
                "temperature": 0.8
            }
        } 