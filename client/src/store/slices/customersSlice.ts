import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Customer } from '@shared/schema';

export interface CustomerWithRFM extends Customer {
  lastPurchaseDate?: string;
  segment: string;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  rfmScore: number;
}

export interface CustomerFilters {
  searchTerm: string;
  segment: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CustomerMetrics {
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  segmentCounts: Record<string, number>;
  topCustomers: CustomerWithRFM[];
}

interface CustomersState {
  customers: CustomerWithRFM[];
  metrics: CustomerMetrics | null;
  filters: CustomerFilters;
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  metrics: null,
  filters: {
    searchTerm: '',
    segment: 'all',
    sortBy: 'totalSpent',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

// Calculate RFM scores for a customer
const calculateRFM = (customer: Customer): Omit<CustomerWithRFM, keyof Customer> => {
  const daysSinceLastPurchase = customer.lastPurchaseDate 
    ? Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
    : 365;
  
  const recencyScore = Math.max(0, 100 - (daysSinceLastPurchase / 3.65));
  const frequencyScore = Math.min(100, (customer.orderCount || 0) * 10);
  const monetaryScore = Math.min(100, parseFloat(customer.totalSpent || "0") / 10);
  const rfmScore = (recencyScore + frequencyScore + monetaryScore) / 3;

  // Determine segment based on RFM scores
  let segment = "new";
  if (rfmScore >= 70) segment = "champions";
  else if (rfmScore >= 50) segment = "loyal_customers";
  else if (recencyScore >= 60 && frequencyScore < 30) segment = "new_customers";
  else if (recencyScore < 30) segment = "at_risk";
  else segment = "potential_loyalists";

  return {
    segment,
    recencyScore: Math.round(recencyScore),
    frequencyScore: Math.round(frequencyScore),
    monetaryScore: Math.round(monetaryScore),
    rfmScore: Math.round(rfmScore),
  };
};

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async () => {
    const response = await apiRequest('GET', '/api/customers');
    const customers = await response.json();
    
    // Enrich customers with RFM data
    const customersWithRFM: CustomerWithRFM[] = customers.map((customer: Customer) => ({
      ...customer,
      ...calculateRFM(customer),
    }));
    
    return customersWithRFM;
  }
);

export const fetchCustomerMetrics = createAsyncThunk(
  'customers/fetchMetrics',
  async () => {
    const response = await apiRequest('GET', '/api/customers/metrics');
    return response.json();
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
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
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(fetchCustomerMetrics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchCustomerMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customer metrics';
      });
  },
});

export const { setFilters, clearFilters, clearError } = customersSlice.actions;
export default customersSlice.reducer;