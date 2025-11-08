from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from typing import List
import shutil
import uuid
import os

from app.repositories import storage_repo
from app.services import video_service
from app.models import VideoSession
from app.config import settings

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_video(file: UploadFile = File(...)):
    """
    Upload a video file and create a new editing session
    
    Args:
        file: Video file to upload
        
    Returns:
        Session details with video URL
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not video_service.validate_video_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail="Invalid video format. Supported: mp4, avi, mov, mkv, webm"
        )
    
    try:
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.uploads_dir, unique_filename)
        
        # Ensure uploads directory exists
        os.makedirs(settings.uploads_dir, exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create session
        session = storage_repo.create_session(
            video_filename=file.filename,
            video_path=file_path
        )
        
        return {
            "id": session.id,
            "video_filename": session.video_filename,
            "video_url": f"/{settings.uploads_dir}/{unique_filename}",
            "created_at": session.created_at
        }
        
    except Exception as e:
        # Clean up file if session creation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{session_id}", response_model=dict)
async def get_video_session(session_id: int):
    """
    Get video session details by ID
    
    Args:
        session_id: Session ID
        
    Returns:
        Session details
    """
    session = storage_repo.get_session_by_id(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    video_filename = Path(session.video_path).name
    
    return {
        "id": session.id,
        "video_filename": session.video_filename,
        "video_url": f"/{settings.uploads_dir}/{video_filename}",
        "created_at": session.created_at
    }


@router.get("/", response_model=List[dict])
async def get_all_sessions():
    """
    Get all video sessions
    
    Returns:
        List of all sessions
    """
    sessions = storage_repo.get_all_sessions()
    
    return [
        {
            "id": s.id,
            "video_filename": s.video_filename,
            "video_url": f"/{settings.uploads_dir}/{Path(s.video_path).name}",
            "created_at": s.created_at
        }
        for s in sessions
    ]


@router.delete("/{session_id}", response_model=dict)
async def delete_session(session_id: int):
    """
    Delete a video session and its associated data
    
    Args:
        session_id: Session ID to delete
        
    Returns:
        Success message
    """
    session = storage_repo.get_session_by_id(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete video file
    if os.path.exists(session.video_path):
        os.remove(session.video_path)
    
    # Delete edits
    storage_repo.delete_edits_by_session(session_id)
    
    # Delete session
    storage_repo.delete_session(session_id)
    
    return {"message": "Session deleted successfully"}