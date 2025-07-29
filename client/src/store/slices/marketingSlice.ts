import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { MarketingCampaign } from '@shared/schema';

export interface CampaignMetrics extends MarketingCampaign {
  roi: number;
  costPerConversion: number;
  conversionRate: number;
  ctr: number; // Click-through rate
  budgetUtilization: number;
}

export interface MarketingFilters {
  channelFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface MarketingAnalytics {
  totalSpent: number;
  totalRevenue: number;
  totalConversions: number;
  overallROI: number;
  avgCostPerConversion: number;
  channelPerformance: Record<string, {
    spent: number;
    revenue: number;
    conversions: number;
    campaigns: number;
    roi: number;
  }>;
  topPerformingCampaigns: CampaignMetrics[];
}

interface MarketingState {
  campaigns: CampaignMetrics[];
  analytics: MarketingAnalytics | null;
  filters: MarketingFilters;
  loading: boolean;
  error: string | null;
}

const initialState: MarketingState = {
  campaigns: [],
  analytics: null,
  filters: {
    channelFilter: 'all',
    statusFilter: 'all',
    sortBy: 'roi',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

// Calculate campaign metrics
const calculateCampaignMetrics = (campaign: MarketingCampaign): CampaignMetrics => {
  const spent = parseFloat(campaign.spent || "0");
  const revenue = parseFloat(campaign.revenue || "0");
  const budget = parseFloat(campaign.budget || "0");
  
  const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;
  const costPerConversion = (campaign.conversions || 0) > 0 ? spent / (campaign.conversions || 1) : 0;
  const conversionRate = (campaign.clicks || 0) > 0 ? ((campaign.conversions || 0) / (campaign.clicks || 1)) * 100 : 0;
  const ctr = (campaign.impressions || 0) > 0 ? ((campaign.clicks || 0) / (campaign.impressions || 1)) * 100 : 0;
  const budgetUtilization = budget > 0 ? (spent / budget) * 100 : 0;

  return {
    ...campaign,
    roi,
    costPerConversion,
    conversionRate,
    ctr,
    budgetUtilization,
  };
};

export const fetchMarketingCampaigns = createAsyncThunk(
  'marketing/fetchCampaigns',
  async () => {
    const response = await apiRequest('GET', '/api/marketing/campaigns');
    const campaigns = await response.json();
    
    // Calculate metrics for each campaign
    const campaignsWithMetrics: CampaignMetrics[] = campaigns.map(calculateCampaignMetrics);
    
    return campaignsWithMetrics;
  }
);

export const fetchMarketingAnalytics = createAsyncThunk(
  'marketing/fetchAnalytics',
  async () => {
    const response = await apiRequest('GET', '/api/marketing/analytics');
    return response.json();
  }
);

export const updateCampaign = createAsyncThunk(
  'marketing/updateCampaign',
  async ({ campaignId, updates }: { campaignId: number; updates: Partial<MarketingCampaign> }) => {
    const response = await apiRequest('PATCH', `/api/marketing/campaigns/${campaignId}`, updates);
    const updatedCampaign = await response.json();
    return calculateCampaignMetrics(updatedCampaign);
  }
);

export const createCampaign = createAsyncThunk(
  'marketing/createCampaign',
  async (campaignData: Omit<MarketingCampaign, 'id'>) => {
    const response = await apiRequest('POST', '/api/marketing/campaigns', campaignData);
    const newCampaign = await response.json();
    return calculateCampaignMetrics(newCampaign);
  }
);

const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MarketingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketingCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketingCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchMarketingCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketing campaigns';
      })
      .addCase(fetchMarketingAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarketingAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchMarketingAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketing analytics';
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(campaign => campaign.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      });
  },
});

export const { setFilters, clearFilters, clearError } = marketingSlice.actions;
export default marketingSlice.reducer;