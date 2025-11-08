from pydantic import BaseModel, Field
from typing import List
from .video import SubtitleSegment, StyleConfig

class Edit(BaseModel):
    """Edit entry for a video session"""
    id: int
    session_id: int
    user_message: str = Field(..., description="User's chat message")
    subtitle_data: List[SubtitleSegment] = Field(..., description="List of subtitle segments")
    style_config: StyleConfig = Field(..., description="Styling configuration")
    created_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "session_id": 1,
                "user_message": "Add subtitle 'Hello World' from 0 to 5 seconds",
                "subtitle_data": [
                    {"start": 0.0, "end": 5.0, "text": "Hello World"}
                ],
                "style_config": {
                    "font_family": "Arial",
                    "font_size": 24,
                    "font_color": "#FFFFFF"
                },
                "created_at": "2025-11-07T10:31:00"
            }
        }