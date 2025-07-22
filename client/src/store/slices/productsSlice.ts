import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@shared/schema';

interface ProductsState {
  products: Product[];
  topProducts: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  topProducts: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await apiRequest('GET', '/api/products');
    return response.json();
  }
);

export const fetchTopProducts = createAsyncThunk(
  'products/fetchTopProducts',
  async (limit: number = 4) => {
    const response = await apiRequest('GET', `/api/products/top?limit=${limit}`);
    return response.json();
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch top products';
      });
  },
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;
