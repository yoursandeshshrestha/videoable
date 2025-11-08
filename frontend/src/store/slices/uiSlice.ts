import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIState {
  notifications: Notification[];
  isExporting: boolean;
  isSidebarOpen: boolean;
}

const initialState: UIState = {
  notifications: [],
  isExporting: false,
  isSidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setExporting: (state, action: PayloadAction<boolean>) => {
      state.isExporting = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const {
  showNotification,
  removeNotification,
  clearNotifications,
  setExporting,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;

