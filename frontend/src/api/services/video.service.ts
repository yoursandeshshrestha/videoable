import { apiClient } from "../client";
import { API_CONFIG } from "../../config/api.config";
import type { UploadVideoResponse, VideoSession } from "../../types";

export const videoService = {
  uploadVideo: async (file: File): Promise<UploadVideoResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<UploadVideoResponse>(
      API_CONFIG.ENDPOINTS.VIDEO.UPLOAD,
      formData
    );
  },

  getSession: async (sessionId: number): Promise<VideoSession> => {
    return apiClient.get<VideoSession>(
      API_CONFIG.ENDPOINTS.VIDEO.GET(sessionId)
    );
  },
};
