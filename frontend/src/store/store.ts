import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './slices/videoSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    video: videoReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['video/uploadVideo/pending'],
        // Ignore these paths in the state
        ignoredPaths: ['video.uploadProgress'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


