from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uuid
import os

from app.repositories import storage_repo
from app.services import video_service
from app.config import settings

router = APIRouter()

class ExportResponse(BaseModel):
    """Response model for export"""
    message: str
    download_url: str

@router.post("/{session_id}/export", response_model=ExportResponse)
async def export_video(session_id: int):
    """
    Export video with burned subtitles
    
    Args:
        session_id: Session ID to export
        
    Returns:
        Download URL for the exported video
    """
    # Validate session
    session = storage_repo.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get latest edit
    latest_edit = storage_repo.get_latest_edit(session_id)
    
    if not latest_edit:
        raise HTTPException(
            status_code=400, 
            detail="No edits found. Please add subtitles first."
        )
    
    # Validate video file exists
    if not os.path.exists(session.video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    try:
        # Generate output filename
        output_filename = f"{uuid.uuid4()}.mp4"
        output_path = os.path.join(settings.outputs_dir, output_filename)
        
        # Ensure outputs directory exists
        os.makedirs(settings.outputs_dir, exist_ok=True)
        
        # Process video with FFmpeg
        video_service.overlay_subtitles(
            video_path=session.video_path,
            subtitles=latest_edit.subtitle_data,
            style=latest_edit.style_config,
            output_path=output_path
        )
        
        return ExportResponse(
            message="Video exported successfully",
            download_url=f"/{settings.outputs_dir}/{output_filename}"
        )
        
    except Exception as e:
        # Clean up output file if it exists
        output_path = os.path.join(settings.outputs_dir, output_filename)
        if os.path.exists(output_path):
            os.remove(output_path)
        
        raise HTTPException(
            status_code=500, 
            detail=f"Video processing failed: {str(e)}"
        )


@router.get("/{session_id}/status", response_model=dict)
async def get_export_status(session_id: int):
    """
    Check if a session is ready for export
    
    Args:
        session_id: Session ID
        
    Returns:
        Export status information
    """
    session = storage_repo.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    latest_edit = storage_repo.get_latest_edit(session_id)
    
    return {
        "session_id": session_id,
        "ready_for_export": latest_edit is not None,
        "has_subtitles": latest_edit is not None and len(latest_edit.subtitle_data) > 0,
        "subtitle_count": len(latest_edit.subtitle_data) if latest_edit else 0
    }