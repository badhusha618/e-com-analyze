# Redux State Management

This document provides a comprehensive overview of the Redux state management implementation for the application.

## Overview

The application uses Redux Toolkit for state management across all screens. The state is organized into logical slices that correspond to different features and screens in the application.

## Store Structure

The main store is configured in `store/index.ts` and includes the following slices:

- **dashboard** - Dashboard metrics and sales data
- **products** - Product catalog and top products
- **alerts** - System alerts and notifications
- **productsPage** - Enhanced product management with analytics
- **customers** - Customer management with RFM analysis
- **reviews** - Review management and sentiment analysis
- **marketing** - Marketing campaign management
- **sentiment** - Real-time sentiment monitoring
- **userManagement** - User, role, and session management
- **auth** - Authentication and user session management

## Slices Overview

### 1. Dashboard Slice (`dashboardSlice.ts`)

Manages dashboard metrics and sales data.

**State:**
```typescript
interface DashboardState {
  metrics: DashboardMetrics | null;
  salesData: any[];
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchDashboardMetrics()` - Fetch dashboard metrics
- `fetchSalesData()` - Fetch sales data
- `clearError()` - Clear error state

### 2. Products Slice (`productsSlice.ts`)

Manages product catalog and top products.

**State:**
```typescript
interface ProductsState {
  products: Product[];
  topProducts: Product[];
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchProducts()` - Fetch all products
- `fetchTopProducts(limit)` - Fetch top performing products
- `clearError()` - Clear error state

### 3. Products Page Slice (`productsPageSlice.ts`)

Enhanced product management with analytics, filtering, and sorting.

**State:**
```typescript
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
```

**Actions:**
- `fetchProductsWithAnalytics()` - Fetch products with analytics data
- `fetchProductDetails(productId)` - Fetch detailed product information
- `setFilters(filters)` - Update filters
- `setSorting(sorting)` - Update sorting
- `selectProduct(product)` - Select a product for detailed view

### 4. Alerts Slice (`alertsSlice.ts`)

Manages system alerts and notifications.

**State:**
```typescript
interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchAlerts()` - Fetch all alerts
- `markAlertAsRead(id)` - Mark alert as read
- `clearError()` - Clear error state

### 5. Customers Slice (`customersSlice.ts`)

Customer management with RFM (Recency, Frequency, Monetary) analysis.

**State:**
```typescript
interface CustomersState {
  customers: CustomerWithRFM[];
  metrics: CustomerMetrics | null;
  filters: CustomerFilters;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchCustomers()` - Fetch customers with RFM analysis
- `fetchCustomerMetrics()` - Fetch customer analytics
- `setFilters(filters)` - Update filters
- `clearFilters()` - Clear all filters

### 6. Reviews Slice (`reviewsSlice.ts`)

Review management and sentiment analysis.

**State:**
```typescript
interface ReviewsState {
  reviews: ReviewWithProduct[];
  analytics: ReviewAnalytics | null;
  filters: ReviewFilters;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchReviews()` - Fetch reviews with product data
- `fetchReviewAnalytics()` - Fetch review analytics
- `updateReviewSentiment({ reviewId, sentiment })` - Update review sentiment
- `setFilters(filters)` - Update filters

### 7. Marketing Slice (`marketingSlice.ts`)

Marketing campaign management with ROI calculations.

**State:**
```typescript
interface MarketingState {
  campaigns: CampaignMetrics[];
  analytics: MarketingAnalytics | null;
  filters: MarketingFilters;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchMarketingCampaigns()` - Fetch campaigns with metrics
- `fetchMarketingAnalytics()` - Fetch marketing analytics
- `updateCampaign({ campaignId, updates })` - Update campaign
- `createCampaign(campaignData)` - Create new campaign
- `setFilters(filters)` - Update filters

### 8. Sentiment Slice (`sentimentSlice.ts`)

Real-time sentiment monitoring and analysis.

**State:**
```typescript
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
```

**Actions:**
- `fetchSentimentData(timeRange)` - Fetch sentiment data
- `fetchProductSentiments()` - Fetch product sentiment analysis
- `fetchSentimentAnalytics()` - Fetch sentiment analytics
- `fetchSentimentAlerts()` - Fetch sentiment alerts
- `markAlertAsRead(alertId)` - Mark alert as read
- `addRealTimeSentiment(data)` - Add real-time sentiment data
- `setConnectionStatus(status)` - Update connection status

### 9. User Management Slice (`userManagementSlice.ts`)

User, role, and session management.

**State:**
```typescript
interface UserManagementState {
  users: UserWithDetails[];
  roles: Role[];
  sessions: SessionWithUser[];
  analytics: UserManagementAnalytics | null;
  filters: UserFilters;
  loading: boolean;
  error: string | null;
  activeTab: 'users' | 'sessions' | 'roles';
}
```

**Actions:**
- `fetchUsers()` - Fetch users with details
- `fetchRoles()` - Fetch roles
- `fetchSessions()` - Fetch active sessions
- `fetchUserAnalytics()` - Fetch user analytics
- `updateUserStatus({ userId, updates })` - Update user status
- `revokeSession(sessionId)` - Revoke user session
- `createUser(userData)` - Create new user
- `updateUserRoles({ userId, roleIds })` - Update user roles
- `setActiveTab(tab)` - Set active tab

### 10. Auth Slice (`authSlice.ts`)

Authentication and user session management.

**State:**
```typescript
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginLoading: boolean;
  registerLoading: boolean;
}
```

**Actions:**
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `refreshToken()` - Refresh authentication token
- `fetchCurrentUser()` - Fetch current user data
- `updateProfile(updates)` - Update user profile
- `changePassword({ currentPassword, newPassword })` - Change password

## Selectors

The application uses memoized selectors for efficient state access. All selectors are defined in `store/selectors.ts`.

### Key Selectors

- **Filtered Data Selectors**: `selectFilteredProducts`, `selectFilteredCustomers`, `selectFilteredReviews`, `selectFilteredCampaigns`, `selectFilteredUsers`
- **Loading States**: `selectDashboardLoading`, `selectProductsLoading`, etc.
- **Error States**: `selectDashboardError`, `selectProductsError`, etc.
- **Permission Check**: `selectHasPermission(permission)` - Check if user has specific permission

### Usage Example

```typescript
import { useAppSelector } from '@/store/hooks';
import { selectFilteredCustomers, selectCustomersLoading } from '@/store/selectors';

function MyComponent() {
  const customers = useAppSelector(selectFilteredCustomers);
  const isLoading = useAppSelector(selectCustomersLoading);
  
  // Component logic...
}
```

## Hooks

Custom Redux hooks are available in `store/hooks.ts`:

- `useAppDispatch()` - Typed dispatch function
- `useAppSelector()` - Typed selector hook

## Usage Examples

### Basic Component with Redux

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFilteredCustomers, selectCustomersLoading } from '@/store/selectors';
import { fetchCustomers, setFilters } from '@/store/slices/customersSlice';

function CustomersPage() {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectFilteredCustomers);
  const isLoading = useAppSelector(selectCustomersLoading);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleSearch = (searchTerm: string) => {
    dispatch(setFilters({ searchTerm }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

### Using Filters and Sorting

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCustomerFilters } from '@/store/selectors';
import { setFilters } from '@/store/slices/customersSlice';

function CustomerFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectCustomerFilters);

  const handleSegmentChange = (segment: string) => {
    dispatch(setFilters({ segment }));
  };

  const handleSortChange = (sortBy: string) => {
    dispatch(setFilters({ sortBy }));
  };

  return (
    <div>
      <select value={filters.segment} onChange={(e) => handleSegmentChange(e.target.value)}>
        <option value="all">All Segments</option>
        <option value="champions">Champions</option>
        <option value="loyal_customers">Loyal Customers</option>
      </select>
      
      <select value={filters.sortBy} onChange={(e) => handleSortChange(e.target.value)}>
        <option value="totalSpent">Total Spent</option>
        <option value="orderCount">Order Count</option>
      </select>
    </div>
  );
}
```

### Real-time Updates (Sentiment)

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSentimentRealTimeData, selectSentimentConnectionStatus } from '@/store/selectors';
import { fetchSentimentData, setConnectionStatus } from '@/store/slices/sentimentSlice';

function SentimentDashboard() {
  const dispatch = useAppDispatch();
  const realTimeData = useAppSelector(selectSentimentRealTimeData);
  const isConnected = useAppSelector(selectSentimentConnectionStatus);

  useEffect(() => {
    dispatch(fetchSentimentData('24h'));
    
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:3000/sentiment');
    
    ws.onopen = () => {
      dispatch(setConnectionStatus(true));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(addRealTimeSentiment(data));
    };
    
    ws.onclose = () => {
      dispatch(setConnectionStatus(false));
    };

    return () => ws.close();
  }, [dispatch]);

  return (
    <div>
      <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {realTimeData.map(sentiment => (
        <div key={sentiment.id}>
          {sentiment.productName}: {sentiment.sentiment}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use Selectors**: Always use selectors to access state instead of directly accessing the store
2. **Memoized Selectors**: Use `createSelector` for expensive computations
3. **Error Handling**: Always handle loading and error states in components
4. **Type Safety**: Use TypeScript interfaces for all state and action types
5. **Async Actions**: Use `createAsyncThunk` for API calls
6. **Normalized State**: Keep state normalized for better performance
7. **Filtering/Sorting**: Handle filtering and sorting in selectors, not in components

## Migration from React Query

The Redux implementation replaces React Query for state management. Key differences:

- **Centralized State**: All state is managed in Redux store
- **Caching**: Redux provides built-in caching through state persistence
- **Real-time Updates**: Redux actions can handle real-time data updates
- **Complex State**: Better handling of complex state relationships
- **DevTools**: Redux DevTools provide better debugging capabilities

## Performance Considerations

1. **Selector Memoization**: Use `createSelector` for expensive computations
2. **State Normalization**: Keep related data normalized
3. **Lazy Loading**: Load data only when needed
4. **Pagination**: Implement pagination for large datasets
5. **Debouncing**: Debounce search inputs to avoid excessive API calls

## Testing

Each slice can be tested independently:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import customersReducer, { fetchCustomers } from './slices/customersSlice';

describe('customers slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        customers: customersReducer,
      },
    });
  });

  it('should handle initial state', () => {
    const state = store.getState().customers;
    expect(state.customers).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('should handle fetchCustomers.pending', () => {
    store.dispatch(fetchCustomers.pending);
    const state = store.getState().customers;
    expect(state.loading).toBe(true);
  });
});
```