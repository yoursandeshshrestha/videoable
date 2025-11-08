export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  ENDPOINTS: {
    VIDEO: {
      UPLOAD: "/api/video/upload",
      GET: (id: number) => `/api/video/${id}`,
      LIST: "/api/video/",
      DELETE: (id: number) => `/api/video/${id}`,
    },
    CHAT: {
      MESSAGE: "/api/chat/message",
      HISTORY: (sessionId: number) => `/api/chat/${sessionId}/history`,
      LATEST: (sessionId: number) => `/api/chat/${sessionId}/latest`,
    },
    EXPORT: {
      EXPORT: (sessionId: number) => `/api/export/${sessionId}/export`,
      STATUS: (sessionId: number) => `/api/export/${sessionId}/status`,
    },
  },
  TIMEOUT: 120000, // Increased for audio transcription
};
