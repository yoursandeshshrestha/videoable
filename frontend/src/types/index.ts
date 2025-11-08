// API Types
export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface StyleConfig {
  font_family: string;
  font_size: number;
  font_color: string;
  background_color: string;
  position: "top" | "center" | "bottom";
  outline_color: string;
  outline_width: number;
}

export interface VideoSession {
  id: number;
  video_filename: string;
  video_url: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  subtitles?: SubtitleSegment[];
  style?: StyleConfig;
  timestamp: string;
}

export interface Edit {
  id: number;
  session_id: number;
  user_message: string;
  subtitle_data: SubtitleSegment[];
  style_config: StyleConfig;
  created_at: string;
}

// API Response Types
export interface UploadVideoResponse {
  id: number;
  video_filename: string;
  video_url: string;
  created_at: string;
}

export interface ChatMessageResponse {
  response: string;
  subtitles: SubtitleSegment[];
  style: StyleConfig;
}

export interface ExportVideoResponse {
  message: string;
  download_url: string;
}

