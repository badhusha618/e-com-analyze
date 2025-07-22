import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Alert } from '@shared/schema';

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  alerts: [],
  loading: false,
  error: null,
};

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async () => {
    const response = await apiRequest('GET', '/api/alerts');
    return response.json();
  }
);

export const markAlertAsRead = createAsyncThunk(
  'alerts/markAsRead',
  async (id: number) => {
    const response = await apiRequest('PATCH', `/api/alerts/${id}/read`);
    return response.json();
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch alerts';
      })
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(alert => alert.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      });
  },
});

export const { clearError } = alertsSlice.actions;
export default alertsSlice.reducer;
