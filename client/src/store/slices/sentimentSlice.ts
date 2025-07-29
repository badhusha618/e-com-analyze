import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';

export interface SentimentData {
  id: string;
  productId: number;
  productName: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: string;
  source: 'review' | 'social' | 'survey';
  text?: string;
  userId?: number;
}

export interface ProductSentiment {
  productId: number;
  productName: string;
  averageSentiment: number;
  sentimentCounts: {
    positive: number;
    negative: number;
    neutral: number;
  };
  trend: Array<{
    date: string;
    sentiment: number;
  }>;
  recentSentiments: SentimentData[];
}

export interface SentimentAlert {
  id: string;
  type: 'sentiment_drop' | 'sentiment_spike' | 'negative_trend';
  productId: number;
  productName: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SentimentFilters {
  timeRange: '1h' | '24h' | '7d' | '30d';
  productFilter: string;
  sentimentFilter: string;
  sourceFilter: string;
}

export interface SentimentAnalytics {
  totalSentiments: number;
  averageSentiment: number;
  sentimentTrend: Array<{
    date: string;
    positive: number;
    negative: number;
    neutral: number;
  }>;
  topProducts: ProductSentiment[];
  recentAlerts: SentimentAlert[];
}

interface SentimentState {
  realTimeData: SentimentData[];
  productSentiments: ProductSentiment[];
  alerts: SentimentAlert[];
  analytics: SentimentAnalytics | null;
  filters: SentimentFilters;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

const initialState: SentimentState = {
  realTimeData: [],
  productSentiments: [],
  alerts: [],
  analytics: null,
  filters: {
    timeRange: '24h',
    productFilter: 'all',
    sentimentFilter: 'all',
    sourceFilter: 'all',
  },
  loading: false,
  error: null,
  isConnected: false,
};

export const fetchSentimentData = createAsyncThunk(
  'sentiment/fetchData',
  async (timeRange: string = '24h') => {
    const response = await apiRequest('GET', `/api/sentiment/data?timeRange=${timeRange}`);
    return response.json();
  }
);

export const fetchProductSentiments = createAsyncThunk(
  'sentiment/fetchProductSentiments',
  async () => {
    const response = await apiRequest('GET', '/api/sentiment/products');
    return response.json();
  }
);

export const fetchSentimentAnalytics = createAsyncThunk(
  'sentiment/fetchAnalytics',
  async () => {
    const response = await apiRequest('GET', '/api/sentiment/analytics');
    return response.json();
  }
);

export const fetchSentimentAlerts = createAsyncThunk(
  'sentiment/fetchAlerts',
  async () => {
    const response = await apiRequest('GET', '/api/sentiment/alerts');
    return response.json();
  }
);

export const markAlertAsRead = createAsyncThunk(
  'sentiment/markAlertAsRead',
  async (alertId: string) => {
    const response = await apiRequest('PATCH', `/api/sentiment/alerts/${alertId}/read`);
    return response.json();
  }
);

const sentimentSlice = createSlice({
  name: 'sentiment',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SentimentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addRealTimeSentiment: (state, action: PayloadAction<SentimentData>) => {
      state.realTimeData.unshift(action.payload);
      // Keep only last 100 entries
      if (state.realTimeData.length > 100) {
        state.realTimeData = state.realTimeData.slice(0, 100);
      }
    },
    addSentimentAlert: (state, action: PayloadAction<SentimentAlert>) => {
      state.alerts.unshift(action.payload);
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentimentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSentimentData.fulfilled, (state, action) => {
        state.loading = false;
        state.realTimeData = action.payload;
      })
      .addCase(fetchSentimentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sentiment data';
      })
      .addCase(fetchProductSentiments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductSentiments.fulfilled, (state, action) => {
        state.loading = false;
        state.productSentiments = action.payload;
      })
      .addCase(fetchProductSentiments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product sentiments';
      })
      .addCase(fetchSentimentAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSentimentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSentimentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sentiment analytics';
      })
      .addCase(fetchSentimentAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSentimentAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchSentimentAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sentiment alerts';
      })
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(alert => alert.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  addRealTimeSentiment, 
  addSentimentAlert, 
  setConnectionStatus, 
  clearError 
} = sentimentSlice.actions;

export default sentimentSlice.reducer;