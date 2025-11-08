import { apiClient } from "../client";
import { API_CONFIG } from "../../config/api.config";
import type { ExportVideoResponse } from "../../types";

export const exportService = {
  exportVideo: async (sessionId: number): Promise<ExportVideoResponse> => {
    return apiClient.post<ExportVideoResponse>(
      API_CONFIG.ENDPOINTS.EXPORT.EXPORT(sessionId)
    );
  },
};
