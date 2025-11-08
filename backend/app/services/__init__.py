from .video_service import VideoService
from .transcription_service import TranscriptionService, transcription_service
from .llm_service import LLMService

video_service = VideoService()
# Lazy load LLM service to avoid initialization errors
llm_service = None

def get_llm_service():
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service

__all__ = [
    "video_service", 
    "get_llm_service", 
    "transcription_service",
    "VideoService", 
    "LLMService",
    "TranscriptionService"
]