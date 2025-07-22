import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';

interface DashboardMetrics {
  totalSales: string;
  totalOrders: string;
  avgOrderValue: string;
  returnRate: string;
  salesChange: string;
  ordersChange: string;
  aovChange: string;
  returnRateChange: string;
  topProducts: any[];
  salesData: any[];
  campaigns: any[];
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  salesData: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  salesData: [],
  loading: false,
  error: null,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async () => {
    const response = await apiRequest('GET', '/api/dashboard/metrics');
    return response.json();
  }
);

export const fetchSalesData = createAsyncThunk(
  'dashboard/fetchSalesData',
  async () => {
    const response = await apiRequest('GET', '/api/sales/metrics');
    return response.json();
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard metrics';
      })
      .addCase(fetchSalesData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.loading = false;
        state.salesData = action.payload;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales data';
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
