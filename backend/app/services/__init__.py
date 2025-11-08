from .video_service import VideoService
from .transcription_service import TranscriptionService, transcription_service

video_service = VideoService()

__all__ = [
    "video_service", 
    "transcription_service",
    "VideoService",
    "TranscriptionService"
]
