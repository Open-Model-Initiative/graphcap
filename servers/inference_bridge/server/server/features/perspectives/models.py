"""
# SPDX-License-Identifier: Apache-2.0
Perspectives API Models

Defines data models for the perspectives API endpoints.
"""

from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field

# Field description constants
DESC_PERSPECTIVE_NAME = "Name of the perspective to use"
DESC_MAX_TOKENS = "Maximum number of tokens in the response"
DESC_TEMPERATURE = "Temperature for generation"
DESC_TOP_P = "Top-p sampling parameter"
DESC_REPETITION_PENALTY = "Repetition penalty"
DESC_GLOBAL_CONTEXT = "Global context for the caption"
DESC_ADDITIONAL_CONTEXT = "Additional context for the caption"
DESC_RESIZE_RESOLUTION = (
    "Resolution to resize to (None to disable, or SD_VGA, HD_720P, FHD_1080P, QHD_1440P, UHD_4K, UHD_8K)"
)


class SchemaField(BaseModel):
    """Schema field information for a perspective."""

    name: str = Field(..., description="Name of the field")
    type: Union[str, Dict[str, Any]] = Field(..., description="Type of the field (str, float, or complex object)")
    description: str = Field(..., description="Description of the field")
    is_list: bool = Field(False, description="Whether the field is a list")
    is_complex: bool = Field(False, description="Whether the field is a complex type")
    fields: Optional[List["SchemaField"]] = Field(None, description="Fields for complex types")


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
    
    # New metadata fields
    module: str = Field("default", description="Module this perspective belongs to")
    tags: List[str] = Field(default_factory=list, description="Tags for categorizing perspectives")
    deprecated: bool = Field(False, description="Whether this perspective is deprecated")
    replacement: Optional[str] = Field(None, description="Name of perspective that replaces this one")
    priority: int = Field(100, description="Priority for sorting (lower is higher priority)")


class PerspectiveListResponse(BaseModel):
    """Response model for listing available perspectives."""

    perspectives: List[PerspectiveInfo] = Field(..., description="List of available perspectives")


class ModuleInfo(BaseModel):
    """Information about a perspective module."""
    
    name: str = Field(..., description="Unique identifier for the module")
    display_name: str = Field(..., description="Human-readable name for the module")
    description: str = Field("", description="Description of the module")
    enabled: bool = Field(True, description="Whether the module is enabled")
    perspective_count: int = Field(0, description="Number of perspectives in this module")


class ModuleListResponse(BaseModel):
    """Response model for listing available modules."""
    
    modules: List[ModuleInfo] = Field(..., description="List of available modules")


class ModulePerspectivesResponse(BaseModel):
    """Response model for perspectives in a module."""
    
    module: ModuleInfo = Field(..., description="Information about the module")
    perspectives: List[PerspectiveInfo] = Field(..., description="List of perspectives in the module")


class ImageSource(BaseModel):
    """Source of an image for captioning."""

    url: Optional[str] = Field(None, description="URL of the image to caption")
    base64: Optional[str] = Field(None, description="Base64-encoded image data")

    class Config:
        schema_extra = {"example": {"url": "https://example.com/image.jpg"}}


class CaptionRequest(BaseModel):
    """Request model for generating a caption with a perspective."""

    perspective: str = Field(..., description=DESC_PERSPECTIVE_NAME)
    image: ImageSource = Field(..., description="Image to caption")
    max_tokens: Optional[int] = Field(4096, description=DESC_MAX_TOKENS)
    temperature: Optional[float] = Field(0.8, description=DESC_TEMPERATURE)
    top_p: Optional[float] = Field(0.9, description=DESC_TOP_P)
    repetition_penalty: Optional[float] = Field(1.15, description=DESC_REPETITION_PENALTY)
    context: Optional[List[str]] = Field(None, description=DESC_ADDITIONAL_CONTEXT)
    global_context: Optional[str] = Field(None, description=DESC_GLOBAL_CONTEXT)
    resize_resolution: Optional[str] = Field(None, description=DESC_RESIZE_RESOLUTION)

    class Config:
        schema_extra = {
            "example": {
                "perspective": "custom_caption",
                "image": {"url": "https://example.com/image.jpg"},
                "max_tokens": 4096,
                "temperature": 0.8,
                "resize_resolution": "HD_720P",
            }
        }


class CaptionResponse(BaseModel):
    """Response model for a generated caption."""

    perspective: str = Field(..., description="Name of the perspective used")
    provider: str = Field(..., description="Name of the provider used")
    result: dict = Field(..., description="Structured caption result")
    raw_text: Optional[str] = Field(None, description="Raw text response from the model")




class CaptionPathRequest(BaseModel):
    """Request model for generating a caption with a perspective using a file path."""

    perspective: str = Field(..., description=DESC_PERSPECTIVE_NAME)
    image_path: str = Field(..., description="Path to the image file in the workspace")
    provider: str = Field(..., description="Name of the provider to use")
    provider_config: dict = Field(..., description="Provider configuration")
    model: str = Field(..., description="Model name to use for processing")
    max_tokens: Optional[int] = Field(4096, description=DESC_MAX_TOKENS)
    temperature: Optional[float] = Field(0.8, description=DESC_TEMPERATURE)
    top_p: Optional[float] = Field(0.9, description=DESC_TOP_P)
    repetition_penalty: Optional[float] = Field(1.15, description=DESC_REPETITION_PENALTY)
    context: Optional[Union[List[str], str]] = Field(None, description=DESC_ADDITIONAL_CONTEXT)
    global_context: Optional[str] = Field(None, description=DESC_GLOBAL_CONTEXT)
    resize_resolution: Optional[str] = Field(None, description=DESC_RESIZE_RESOLUTION)

    class Config:
        schema_extra = {
            "example": {
                "perspective": "custom_caption",
                "image_path": "/workspace/datasets/example.jpg",
                "provider": "gemini",
                "model": "gemini-pro-vision",
                "provider_config": {
                    "name": "gemini",
                    "kind": "gemini",
                    "environment": "cloud",
                    "api_key": "your_api_key_here",
                    "base_url": "https://generativelanguage.googleapis.com/v1beta",
                    "models": ["gemini-pro-vision"]
                },
                "max_tokens": 4096,
                "temperature": 0.8,
                "resize_resolution": "HD_720P",
            }
        }
