import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { chatService } from "../../api/services";
import type {
  ChatMessage,
  SubtitleSegment,
  StyleConfig,
  Edit,
} from "../../types";

interface ChatState {
  messages: ChatMessage[];
  currentSubtitles: SubtitleSegment[];
  currentStyle: StyleConfig | null;
  loading: boolean;
  error: string | null;
  editHistory: Edit[];
}

const initialState: ChatState = {
  messages: [],
  currentSubtitles: [],
  currentStyle: null,
  loading: false,
  error: null,
  editHistory: [],
};

// Async thunks
export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { sessionId, message }: { sessionId: number; message: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await chatService.sendMessage(sessionId, message);
      return { message, response };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  "chat/fetchHistory",
  async (sessionId: number, { rejectWithValue }) => {
    try {
      const response = await chatService.getChatHistory(sessionId);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch history";
      return rejectWithValue(message);
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentSubtitles = [];
      state.currentStyle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { response } = action.payload;

        // Add assistant response
        state.messages.push({
          role: "assistant",
          content: response.response,
          subtitles: response.subtitles,
          style: response.style,
          timestamp: new Date().toISOString(),
        });

        // Update current subtitles and style (create new references to trigger re-render)
        state.currentSubtitles = [...response.subtitles];
        state.currentStyle = { ...response.style };
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch history
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.editHistory = action.payload.edits;

        // Reconstruct messages from edit history
        state.messages = action.payload.edits.flatMap((edit) => [
          {
            role: "user" as const,
            content: edit.user_message,
            timestamp: edit.created_at,
          },
          {
            role: "assistant" as const,
            content: `Updated subtitles and style`,
            subtitles: edit.subtitle_data,
            style: edit.style_config,
            timestamp: edit.created_at,
          },
        ]);

        // Set current subtitles and style from latest edit
        if (action.payload.edits.length > 0) {
          const latest = action.payload.edits[action.payload.edits.length - 1];
          state.currentSubtitles = latest.subtitle_data;
          state.currentStyle = latest.style_config;
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addUserMessage, clearMessages, clearError, resetChatState } =
  chatSlice.actions;
export default chatSlice.reducer;
