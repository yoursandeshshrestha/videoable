from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SubtitleSegment(BaseModel):
    """Individual subtitle segment with timing"""
    start: float = Field(..., ge=0, description="Start time in seconds")
    end: float = Field(..., gt=0, description="End time in seconds")
    text: str = Field(..., min_length=1, description="Subtitle text")
    
    class Config:
        json_schema_extra = {
            "example": {
                "start": 0.0,
                "end": 5.0,
                "text": "Hello World"
            }
        }

class StyleConfig(BaseModel):
    """Subtitle styling configuration"""
    font_family: str = Field(default="Arial", description="Font family name")
    font_size: int = Field(default=24, ge=12, le=72, description="Font size in pixels")
    font_color: str = Field(default="#FFFFFF", description="Font color in hex format")
    background_color: str = Field(default="#000000", description="Background color in hex")
    position: str = Field(default="bottom", description="Subtitle position: top, center, bottom")
    outline_color: str = Field(default="#000000", description="Outline color in hex")
    outline_width: int = Field(default=2, ge=0, le=10, description="Outline width in pixels")
    margin_vertical: int = Field(default=50, ge=0, le=200, description="Vertical margin from edge in pixels")
    margin_horizontal: int = Field(default=0, ge=0, le=200, description="Horizontal margin from edge in pixels")
    
    class Config:
        json_schema_extra = {
            "example": {
                "font_family": "Arial",
                "font_size": 24,
                "font_color": "#FFFFFF",
                "background_color": "#000000",
                "position": "bottom",
                "outline_color": "#000000",
                "outline_width": 2
            }
        }

class VideoSession(BaseModel):
    """Video editing session"""
    id: int
    video_filename: str
    video_path: str
    created_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "video_filename": "my_video.mp4",
                "video_path": "uploads/abc-123.mp4",
                "created_at": "2025-11-07T10:30:00"
            }
        }