import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@shared/schema';

export interface ProductFilters {
  category?: string;
  vendor?: string;
  ratingRange?: [number, number];
  priceRange?: [number, number];
  searchQuery?: string;
}

export interface ProductSorting {
  field: 'name' | 'price' | 'rating' | 'sales' | 'revenue' | 'healthScore';
  direction: 'asc' | 'desc';
}

export interface ProductAnalytics {
  totalSales: number;
  revenue: number;
  healthScore: number;
  abcClassification: 'A' | 'B' | 'C';
  salesTrend: Array<{ date: string; sales: number }>;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  frequentIssues: string[];
}

export interface EnrichedProduct extends Product {
  analytics: ProductAnalytics;
}

interface ProductsPageState {
  products: EnrichedProduct[];
  selectedProduct: EnrichedProduct | null;
  filters: ProductFilters;
  sorting: ProductSorting;
  loading: boolean;
  error: string | null;
  categories: string[];
  vendors: string[];
}

const initialState: ProductsPageState = {
  products: [],
  selectedProduct: null,
  filters: {},
  sorting: { field: 'healthScore', direction: 'desc' },
  loading: false,
  error: null,
  categories: [],
  vendors: [],
};

// Async thunks
export const fetchProductsWithAnalytics = createAsyncThunk(
  'productsPage/fetchProductsWithAnalytics',
  async () => {
    const [productsResponse, categoriesResponse, vendorsResponse] = await Promise.all([
      apiRequest('GET', '/api/products'),
      apiRequest('GET', '/api/categories'),
      apiRequest('GET', '/api/vendors')
    ]);
    
    const products = await productsResponse.json();
    const categories = await categoriesResponse.json();
    const vendors = await vendorsResponse.json();
    
    // Enrich products with analytics data
    const enrichedProducts: EnrichedProduct[] = products.map((product: Product) => {
      const salesVolume = Math.floor(Math.random() * 2000 + 200);
      const revenue = parseFloat(product.price) * salesVolume;
      const profitMargin = ((parseFloat(product.price) - parseFloat(product.costPrice)) / parseFloat(product.price)) * 100;
      const inventoryTurnover = salesVolume / Math.max(product.inventory, 1);
      const rating = parseFloat(product.rating || '0');
      
      // Calculate health score (0-100)
      const healthScore = Math.min(100, Math.max(0, 
        (rating * 15) + 
        (profitMargin * 0.5) + 
        (Math.min(inventoryTurnover * 10, 30)) + 
        (salesVolume / 50)
      ));
      
      // ABC Classification based on revenue
      let abcClassification: 'A' | 'B' | 'C' = 'C';
      if (revenue > 50000) abcClassification = 'A';
      else if (revenue > 20000) abcClassification = 'B';
      
      // Generate mock sentiment data
      const sentimentBreakdown = {
        positive: Math.floor(Math.random() * 40 + 40),
        neutral: Math.floor(Math.random() * 30 + 20),
        negative: Math.floor(Math.random() * 20 + 10),
      };
      
      // Generate sales trend data
      const salesTrend = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 100 + 50)
      }));
      
      const frequentIssues = [
        'Shipping delays',
        'Product quality',
        'Size issues',
        'Color mismatch',
        'Packaging damage'
      ].slice(0, Math.floor(Math.random() * 3 + 1));
      
      return {
        ...product,
        analytics: {
          totalSales: salesVolume,
          revenue,
          healthScore: Math.round(healthScore),
          abcClassification,
          salesTrend,
          sentimentBreakdown,
          frequentIssues,
        }
      };
    });
    
    return {
      products: enrichedProducts,
      categories: categories.map((cat: any) => cat.name),
      vendors: vendors.map((vendor: any) => vendor.name)
    };
  }
);

export const fetchProductDetails = createAsyncThunk(
  'productsPage/fetchProductDetails',
  async (productId: number) => {
    const [productResponse, reviewsResponse] = await Promise.all([
      apiRequest('GET', `/api/products/${productId}`),
      apiRequest('GET', `/api/products/${productId}/reviews`)
    ]);
    
    const product = await productResponse.json();
    const reviews = await reviewsResponse.json();
    
    // Process reviews for sentiment analysis
    const sentimentCounts = reviews.reduce((acc: any, review: any) => {
      const sentiment = review.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const totalReviews = reviews.length;
    const sentimentBreakdown = {
      positive: Math.round(((sentimentCounts.positive || 0) / totalReviews) * 100) || 0,
      neutral: Math.round(((sentimentCounts.neutral || 0) / totalReviews) * 100) || 0,
      negative: Math.round(((sentimentCounts.negative || 0) / totalReviews) * 100) || 0,
    };
    
    return {
      ...product,
      reviews,
      sentimentBreakdown
    };
  }
);

const productsPageSlice = createSlice({
  name: 'productsPage',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSorting: (state, action: PayloadAction<ProductSorting>) => {
      state.sorting = action.payload;
    },
    selectProduct: (state, action: PayloadAction<EnrichedProduct | null>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsWithAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsWithAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.categories = action.payload.categories;
        state.vendors = action.payload.vendors;
      })
      .addCase(fetchProductsWithAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Update selected product with detailed analytics
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product details';
      });
  },
});

export const { setFilters, clearFilters, setSorting, selectProduct, clearError } = productsPageSlice.actions;
export default productsPageSlice.reducer;