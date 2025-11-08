import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { videoService } from "../../api/services";
import type { VideoSession } from "../../types";

interface VideoState {
  currentSession: VideoSession | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: VideoState = {
  currentSession: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

// Async thunks
export const uploadVideo = createAsyncThunk(
  "video/uploadVideo",
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await videoService.uploadVideo(file);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      return rejectWithValue(message);
    }
  }
);

export const fetchSession = createAsyncThunk(
  "video/fetchSession",
  async (sessionId: number, { rejectWithValue }) => {
    try {
      const response = await videoService.getSession(sessionId);
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch session";
      return rejectWithValue(message);
    }
  }
);

// Slice
const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<VideoSession | null>) => {
      state.currentSession = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetVideoState: () => initialState,
  },
  extraReducers: (builder) => {
    // Upload video
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.uploadProgress = 100;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });

    // Fetch session
    builder
      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentSession, clearError, resetVideoState } =
  videoSlice.actions;
export default videoSlice.reducer;
