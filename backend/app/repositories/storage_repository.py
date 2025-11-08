import json
import os
from typing import List, Optional
from datetime import datetime
from app.models import VideoSession, Edit, SubtitleSegment, StyleConfig
from app.config import settings

class StorageRepository:
    """Repository for file-based storage operations"""
    
    def __init__(self):
        self.data_dir = settings.data_dir
        self.sessions_file = os.path.join(self.data_dir, "sessions.json")
        self.edits_file = os.path.join(self.data_dir, "edits.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        if not os.path.exists(self.sessions_file):
            self._write_json(self.sessions_file, [])
        if not os.path.exists(self.edits_file):
            self._write_json(self.edits_file, [])
    
    def _read_json(self, filepath: str) -> List[dict]:
        """Read JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _write_json(self, filepath: str, data: List[dict]):
        """Write JSON file"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # ========== SESSION OPERATIONS ==========
    
    def create_session(self, video_filename: str, video_path: str) -> VideoSession:
        """Create a new video session"""
        sessions = self._read_json(self.sessions_file)
        
        # Generate new ID
        new_id = max([s.get('id', 0) for s in sessions], default=0) + 1
        
        # Create new session
        session = VideoSession(
            id=new_id,
            video_filename=video_filename,
            video_path=video_path,
            created_at=datetime.utcnow().isoformat()
        )
        
        # Add to sessions
        sessions.append(session.model_dump())
        self._write_json(self.sessions_file, sessions)
        
        return session
    
    def get_session_by_id(self, session_id: int) -> Optional[VideoSession]:
        """Get a session by ID"""
        sessions = self._read_json(self.sessions_file)
        
        for session_data in sessions:
            if session_data['id'] == session_id:
                return VideoSession(**session_data)
        
        return None
    
    def get_all_sessions(self) -> List[VideoSession]:
        """Get all sessions"""
        sessions = self._read_json(self.sessions_file)
        return [VideoSession(**s) for s in sessions]
    
    def delete_session(self, session_id: int) -> bool:
        """Delete a session"""
        sessions = self._read_json(self.sessions_file)
        original_length = len(sessions)
        sessions = [s for s in sessions if s['id'] != session_id]
        
        if len(sessions) < original_length:
            self._write_json(self.sessions_file, sessions)
            return True
        return False
    
    # ========== EDIT OPERATIONS ==========
    
    def create_edit(
        self, 
        session_id: int, 
        user_message: str, 
        subtitle_data: List[SubtitleSegment], 
        style_config: StyleConfig
    ) -> Edit:
        """Create a new edit"""
        edits = self._read_json(self.edits_file)
        
        # Generate new ID
        new_id = max([e.get('id', 0) for e in edits], default=0) + 1
        
        # Create new edit
        edit = Edit(
            id=new_id,
            session_id=session_id,
            user_message=user_message,
            subtitle_data=subtitle_data,
            style_config=style_config,
            created_at=datetime.utcnow().isoformat()
        )
        
        # Add to edits
        edits.append(edit.model_dump())
        self._write_json(self.edits_file, edits)
        
        return edit
    
    def get_edits_by_session(self, session_id: int) -> List[Edit]:
        """Get all edits for a session"""
        edits = self._read_json(self.edits_file)
        
        session_edits = [
            Edit(**e) for e in edits 
            if e['session_id'] == session_id
        ]
        
        # Sort by created_at
        session_edits.sort(key=lambda x: x.created_at)
        
        return session_edits
    
    def get_latest_edit(self, session_id: int) -> Optional[Edit]:
        """Get the most recent edit for a session"""
        edits = self.get_edits_by_session(session_id)
        
        if edits:
            return edits[-1]  # Last edit (most recent)
        
        return None
    
    def get_edit_by_id(self, edit_id: int) -> Optional[Edit]:
        """Get a specific edit by ID"""
        edits = self._read_json(self.edits_file)
        
        for edit_data in edits:
            if edit_data['id'] == edit_id:
                return Edit(**edit_data)
        
        return None
    
    def delete_edits_by_session(self, session_id: int) -> int:
        """Delete all edits for a session"""
        edits = self._read_json(self.edits_file)
        original_length = len(edits)
        edits = [e for e in edits if e['session_id'] != session_id]
        
        deleted_count = original_length - len(edits)
        if deleted_count > 0:
            self._write_json(self.edits_file, edits)
        
        return deleted_count