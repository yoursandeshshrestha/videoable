import ffmpeg
import os
from typing import List
from app.models import SubtitleSegment, StyleConfig

class VideoService:
    """Service for video processing operations"""
    
    @staticmethod
    def create_srt_file(subtitles: List[SubtitleSegment], output_path: str) -> None:
        """Generate SRT subtitle file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            for idx, subtitle in enumerate(subtitles, 1):
                start_time = VideoService._format_timestamp(subtitle.start)
                end_time = VideoService._format_timestamp(subtitle.end)
                
                f.write(f"{idx}\n")
                f.write(f"{start_time} --> {end_time}\n")
                f.write(f"{subtitle.text}\n\n")
    
    @staticmethod
    def _format_timestamp(seconds: float) -> str:
        """Convert seconds to SRT timestamp format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
    
    @staticmethod
    def overlay_subtitles(
        video_path: str, 
        subtitles: List[SubtitleSegment], 
        style: StyleConfig, 
        output_path: str
    ) -> None:
        """Burn subtitles into video using FFmpeg"""
        # Create temporary SRT file
        srt_path = output_path.replace('.mp4', '.srt')
        VideoService.create_srt_file(subtitles, srt_path)
        
        # FFmpeg subtitle styling
        font_size = style.font_size
        primary_color = VideoService._hex_to_ass_color(style.font_color)
        outline_color = VideoService._hex_to_ass_color(style.outline_color)
        back_color = VideoService._hex_to_ass_color(style.background_color)
        
        # Position mapping with custom margins
        margin_v = style.margin_vertical
        margin_h = style.margin_horizontal
        
        position_map = {
            "top": f"Alignment=8,MarginV={margin_v},MarginL={margin_h},MarginR={margin_h}",
            "center": f"Alignment=5,MarginL={margin_h},MarginR={margin_h}",
            "bottom": f"Alignment=2,MarginV={margin_v},MarginL={margin_h},MarginR={margin_h}"
        }
        position_style = position_map.get(style.position, f"Alignment=2,MarginV={margin_v},MarginL={margin_h},MarginR={margin_h}")
        
        # Determine border style (1 = outline only, 3 = opaque box, 4 = transparent box)
        border_style = 1 if style.background_color == "#00000000" else 3
        
        # Build subtitle style
        subtitle_style = (
            f"FontName={style.font_family},"
            f"FontSize={font_size},"
            f"PrimaryColour={primary_color},"
            f"BackColour={back_color},"
            f"OutlineColour={outline_color},"
            f"BorderStyle={border_style},"
            f"Outline={style.outline_width},"
            f"{position_style}"
        )
        
        try:
            # Run FFmpeg
            (
                ffmpeg
                .input(video_path)
                .output(
                    output_path,
                    vf=f"subtitles={srt_path}:force_style='{subtitle_style}'",
                    **{'c:a': 'copy'}
                )
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            
            # Clean up SRT file
            if os.path.exists(srt_path):
                os.remove(srt_path)
            
        except ffmpeg.Error as e:
            # Clean up on error
            if os.path.exists(srt_path):
                os.remove(srt_path)
            raise Exception(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
    
    @staticmethod
    def _hex_to_ass_color(hex_color: str) -> str:
        """Convert hex color to ASS format (&HAABBGGRR) with alpha support"""
        hex_color = hex_color.lstrip('#')
        
        # Handle different hex formats
        if len(hex_color) == 8:  # RRGGBBAA
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            a = int(hex_color[6:8], 16)
            # ASS uses inverted alpha (FF = transparent, 00 = opaque)
            ass_alpha = 255 - a
            return f"&H{ass_alpha:02X}{b:02X}{g:02X}{r:02X}"
        elif len(hex_color) == 6:  # RRGGBB
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            return f"&H00{b:02X}{g:02X}{r:02X}"
        else:
            # Default to white
            return f"&H00FFFFFF"
    
    @staticmethod
    def get_video_duration(video_path: str) -> float:
        """Get video duration in seconds"""
        try:
            probe = ffmpeg.probe(video_path)
            duration = float(probe['streams'][0]['duration'])
            return duration
        except Exception as e:
            raise Exception(f"Failed to get video duration: {str(e)}")
    
    @staticmethod
    def validate_video_file(filename: str) -> bool:
        """Validate video file extension"""
        allowed_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        ext = os.path.splitext(filename)[1].lower()
        return ext in allowed_extensions