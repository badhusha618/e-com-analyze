import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Review, Product } from '@shared/schema';

export interface ReviewWithProduct extends Review {
  product?: Product;
  sentimentScore?: number;
}

export interface ReviewFilters {
  searchTerm: string;
  ratingFilter: string;
  sentimentFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  lowRatedReviews: number;
  positiveReviews: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ratingDistribution: Record<number, number>;
  topProducts: Array<{
    productId: number;
    productName: string;
    averageRating: number;
    reviewCount: number;
  }>;
}

interface ReviewsState {
  reviews: ReviewWithProduct[];
  analytics: ReviewAnalytics | null;
  filters: ReviewFilters;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  analytics: null,
  filters: {
    searchTerm: '',
    ratingFilter: 'all',
    sentimentFilter: 'all',
    sortBy: 'reviewDate',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async () => {
    const [reviewsResponse, productsResponse] = await Promise.all([
      apiRequest('GET', '/api/reviews'),
      apiRequest('GET', '/api/products')
    ]);
    
    const reviews = await reviewsResponse.json();
    const products = await productsResponse.json();
    
    // Enrich reviews with product data
    const reviewsWithProducts: ReviewWithProduct[] = reviews.map((review: Review) => {
      const product = products.find((p: Product) => p.id === review.productId);
      return {
        ...review,
        product,
        sentimentScore: review.sentiment === 'positive' ? 1 : review.sentiment === 'negative' ? -1 : 0,
      };
    });
    
    return reviewsWithProducts;
  }
);

export const fetchReviewAnalytics = createAsyncThunk(
  'reviews/fetchAnalytics',
  async () => {
    const response = await apiRequest('GET', '/api/reviews/analytics');
    return response.json();
  }
);

export const updateReviewSentiment = createAsyncThunk(
  'reviews/updateSentiment',
  async ({ reviewId, sentiment }: { reviewId: number; sentiment: string }) => {
    const response = await apiRequest('PATCH', `/api/reviews/${reviewId}/sentiment`, {
      sentiment,
    });
    return response.json();
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ReviewFilters>>) => {
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
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      .addCase(fetchReviewAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReviewAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchReviewAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch review analytics';
      })
      .addCase(updateReviewSentiment.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(review => review.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = {
            ...state.reviews[index],
            sentiment: action.payload.sentiment,
            sentimentScore: action.payload.sentiment === 'positive' ? 1 : 
                           action.payload.sentiment === 'negative' ? -1 : 0,
          };
        }
      });
  },
});

export const { setFilters, clearFilters, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;