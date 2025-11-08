import { apiClient } from "../client";
import { API_CONFIG } from "../../config/api.config";
import type { ChatMessageResponse, Edit } from "../../types";

export const chatService = {
  sendMessage: async (
    sessionId: number,
    message: string
  ): Promise<ChatMessageResponse> => {
    return apiClient.post<ChatMessageResponse>(
      API_CONFIG.ENDPOINTS.CHAT.MESSAGE,
      { session_id: sessionId, message }
    );
  },

  getChatHistory: async (
    sessionId: number
  ): Promise<{ session_id: number; total_edits: number; edits: Edit[] }> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.CHAT.HISTORY(sessionId));
  },
};
