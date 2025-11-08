from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.repositories import storage_repo
from app.services import get_llm_service
from app.models import SubtitleSegment, StyleConfig

router = APIRouter()

class ChatMessageRequest(BaseModel):
    """Request model for chat message"""
    session_id: int = Field(..., description="Video session ID")
    message: str = Field(..., min_length=1, description="User's chat message")

class ChatMessageResponse(BaseModel):
    """Response model for chat message"""
    response: str
    subtitles: List[SubtitleSegment]
    style: StyleConfig

@router.post("/message", response_model=ChatMessageResponse)
async def process_chat_message(request: ChatMessageRequest):
    """
    Process a chat message and generate subtitle response
    
    Args:
        request: Chat message request containing session_id and message
        
    Returns:
        AI response with updated subtitles and style
    """
    # Validate session exists
    session = storage_repo.get_session_by_id(request.session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # Get previous edits for context
        previous_edits = storage_repo.get_edits_by_session(request.session_id)
        
        previous_edits_data = [
            {
                "subtitles": [s.model_dump() for s in edit.subtitle_data],
                "style": edit.style_config.model_dump()
            }
            for edit in previous_edits
        ]
        
        # Process with LLM service
        llm_service = get_llm_service()
        result = await llm_service.process_message(
            session_id=request.session_id,
            message=request.message,
            previous_edits=previous_edits_data
        )
        
        # Save edit to storage
        storage_repo.create_edit(
            session_id=request.session_id,
            user_message=request.message,
            subtitle_data=result["subtitles"],
            style_config=result["style"]
        )
        
        return ChatMessageResponse(
            response=result["response"],
            subtitles=result["subtitles"],
            style=result["style"]
        )
        
    except Exception as e:
        import traceback
        print(f"ERROR in chat controller: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process message: {str(e)}"
        )


@router.get("/{session_id}/history", response_model=dict)
async def get_chat_history(session_id: int):
    """
    Get all edits (chat history) for a session
    
    Args:
        session_id: Session ID
        
    Returns:
        Chat history with all edits
    """
    session = storage_repo.get_session_by_id(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    edits = storage_repo.get_edits_by_session(session_id)
    
    return {
        "session_id": session_id,
        "total_edits": len(edits),
        "edits": [
            {
                "id": edit.id,
                "user_message": edit.user_message,
                "subtitle_data": edit.subtitle_data,
                "style_config": edit.style_config,
                "created_at": edit.created_at
            }
            for edit in edits
        ]
    }


@router.get("/{session_id}/latest", response_model=dict)
async def get_latest_edit(session_id: int):
    """
    Get the latest edit for a session
    
    Args:
        session_id: Session ID
        
    Returns:
        Latest edit details
    """
    session = storage_repo.get_session_by_id(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    edit = storage_repo.get_latest_edit(session_id)
    
    if not edit:
        raise HTTPException(status_code=404, detail="No edits found for this session")
    
    return {
        "id": edit.id,
        "session_id": edit.session_id,
        "user_message": edit.user_message,
        "subtitle_data": edit.subtitle_data,
        "style_config": edit.style_config,
        "created_at": edit.created_at
    }