import { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { SubtitleSegment, StyleConfig } from '../../types';
import { API_CONFIG } from '../../config/api.config';

interface VideoPlayerProps {
  videoUrl: string;
  subtitles: SubtitleSegment[];
  style: StyleConfig | null;
}

const VideoPlayer = ({ videoUrl, subtitles, style }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Calculate full video URL first
  const fullVideoUrl = videoUrl.startsWith('http')
    ? videoUrl
    : `${API_CONFIG.BASE_URL}${videoUrl}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Reload video when URL changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && fullVideoUrl) {
      video.load();
    }
  }, [fullVideoUrl]);

  // Update current subtitle when time, subtitles, or style changes
  useEffect(() => {
    const subtitle = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
    setCurrentSubtitle(subtitle?.text || '');
  }, [currentTime, subtitles, style]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    // Auto-hide controls after 2 seconds of no movement
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    video.currentTime = percentage * duration;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getSubtitleStyle = (): React.CSSProperties => {
    if (!style) return {};

    const baseStyle: React.CSSProperties = {
      fontFamily: style.font_family,
      fontSize: `${style.font_size}px`,
      color: style.font_color,
      backgroundColor: style.background_color && style.background_color !== '' && style.background_color !== 'transparent' 
        ? style.background_color + '80' 
        : 'transparent',
      WebkitTextStroke: style.outline_width > 0 ? `${style.outline_width}px ${style.outline_color}` : 'none',
    };

    // Apply position with margin
    if (style.position === 'top') {
      return {
        ...baseStyle,
        top: `${style.margin_vertical}px`,
        transform: 'translateX(-50%)',
      };
    } else if (style.position === 'center') {
      return {
        ...baseStyle,
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    } else {
      // bottom
      return {
        ...baseStyle,
        bottom: `${style.margin_vertical}px`,
        transform: 'translateX(-50%)',
      };
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div 
        className="relative w-full bg-black rounded-lg overflow-hidden border border-[#37322f]/10 cursor-pointer"
        onClick={togglePlayPause}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={fullVideoUrl}
          className="w-full h-auto"
          key={fullVideoUrl}
        >
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Button in Center */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              className="pointer-events-auto bg-[#37322f]/80 hover:bg-[#37322f] text-white rounded-full p-4 transition-all duration-200 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" fill="white" />
              ) : (
                <Play className="w-8 h-8 ml-0.5" fill="white" />
              )}
            </button>
          </div>
        )}

        {currentSubtitle && (
          <div
            key={JSON.stringify(style)}
            className="absolute left-1/2 px-4 py-2 rounded-lg font-bold text-center pointer-events-none"
            style={getSubtitleStyle()}
          >
            {currentSubtitle}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-3 px-2 flex-shrink-0">
        <div 
          className="relative h-2 bg-[#37322f]/20 rounded-full cursor-pointer group"
          onClick={handleTimelineClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[#37322f] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#37322f] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-xs text-[#37322f]/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;


