import os
import tempfile
from typing import List
from openai import OpenAI
import ffmpeg
from app.models import SubtitleSegment
from app.config import settings

class TranscriptionService:
    """Service for audio transcription using OpenAI Whisper"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
    
    def extract_audio(self, video_path: str) -> str:
        """Extract audio from video file to temporary WAV file"""
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        audio_path = temp_audio.name
        temp_audio.close()
        
        try:
            # Extract audio using FFmpeg
            (
                ffmpeg
                .input(video_path)
                .output(audio_path, acodec='pcm_s16le', ac=1, ar='16000')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            return audio_path
        except ffmpeg.Error as e:
            if os.path.exists(audio_path):
                os.remove(audio_path)
            raise Exception(f"Failed to extract audio: {e.stderr.decode()}")
    
    def transcribe_audio(self, audio_path: str) -> List[SubtitleSegment]:
        """Transcribe audio file using OpenAI Whisper API"""
        try:
            with open(audio_path, 'rb') as audio_file:
                # Use Whisper API with timestamp feature
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"]
                )
            
            # Convert Whisper segments to SubtitleSegments
            subtitles = []
            if hasattr(transcription, 'segments') and transcription.segments:
                for segment in transcription.segments:
                    # Access as object attributes, not dictionary
                    subtitles.append(
                        SubtitleSegment(
                            start=float(segment.start),
                            end=float(segment.end),
                            text=segment.text.strip()
                        )
                    )
            else:
                # Fallback: create a single subtitle for the whole transcription
                subtitles.append(
                    SubtitleSegment(
                        start=0.0,
                        end=5.0,
                        text=transcription.text
                    )
                )
            
            return subtitles
            
        except Exception as e:
            raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    def generate_subtitles_from_video(self, video_path: str) -> List[SubtitleSegment]:
        """
        Complete workflow: Extract audio and generate subtitles
        
        Args:
            video_path: Path to video file
            
        Returns:
            List of subtitle segments with timestamps
        """
        audio_path = None
        try:
            # Extract audio
            audio_path = self.extract_audio(video_path)
            
            # Transcribe
            subtitles = self.transcribe_audio(audio_path)
            
            return subtitles
            
        finally:
            # Clean up temporary audio file
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)

# Singleton instance
transcription_service = TranscriptionService()