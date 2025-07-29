import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Dashboard Selectors
export const selectDashboardMetrics = (state: RootState) => state.dashboard.metrics;
export const selectDashboardSalesData = (state: RootState) => state.dashboard.salesData;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

// Products Selectors
export const selectProducts = (state: RootState) => state.products.products;
export const selectTopProducts = (state: RootState) => state.products.topProducts;
export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectProductsError = (state: RootState) => state.products.error;

// Products Page Selectors
export const selectProductsPageProducts = (state: RootState) => state.productsPage.products;
export const selectProductsPageSelectedProduct = (state: RootState) => state.productsPage.selectedProduct;
export const selectProductsPageFilters = (state: RootState) => state.productsPage.filters;
export const selectProductsPageSorting = (state: RootState) => state.productsPage.sorting;
export const selectProductsPageCategories = (state: RootState) => state.productsPage.categories;
export const selectProductsPageVendors = (state: RootState) => state.productsPage.vendors;
export const selectProductsPageLoading = (state: RootState) => state.productsPage.loading;
export const selectProductsPageError = (state: RootState) => state.productsPage.error;

// Filtered and sorted products
export const selectFilteredProducts = createSelector(
  [selectProductsPageProducts, selectProductsPageFilters, selectProductsPageSorting],
  (products, filters, sorting) => {
    let filtered = products.filter(product => {
      const matchesCategory = !filters.category || product.categoryId?.toString() === filters.category;
      const matchesVendor = !filters.vendor || product.vendorId?.toString() === filters.vendor;
      const matchesSearch = !filters.searchQuery || 
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      if (filters.priceRange) {
        const price = parseFloat(product.price);
        const [min, max] = filters.priceRange;
        if (price < min || price > max) return false;
      }
      
      if (filters.ratingRange) {
        const rating = parseFloat(product.rating || '0');
        const [min, max] = filters.ratingRange;
        if (rating < min || rating > max) return false;
      }
      
      return matchesCategory && matchesVendor && matchesSearch;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sorting.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'rating':
          aValue = parseFloat(a.rating || '0');
          bValue = parseFloat(b.rating || '0');
          break;
        case 'sales':
          aValue = a.analytics?.totalSales || 0;
          bValue = b.analytics?.totalSales || 0;
          break;
        case 'revenue':
          aValue = a.analytics?.revenue || 0;
          bValue = b.analytics?.revenue || 0;
          break;
        case 'healthScore':
          aValue = a.analytics?.healthScore || 0;
          bValue = b.analytics?.healthScore || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sorting.direction === 'desc') {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

    return filtered;
  }
);

// Alerts Selectors
export const selectAlerts = (state: RootState) => state.alerts.alerts;
export const selectAlertsLoading = (state: RootState) => state.alerts.loading;
export const selectAlertsError = (state: RootState) => state.alerts.error;
export const selectUnreadAlerts = createSelector(
  [selectAlerts],
  (alerts) => alerts.filter(alert => !alert.isRead)
);

// Customers Selectors
export const selectCustomers = (state: RootState) => state.customers.customers;
export const selectCustomerMetrics = (state: RootState) => state.customers.metrics;
export const selectCustomerFilters = (state: RootState) => state.customers.filters;
export const selectCustomersLoading = (state: RootState) => state.customers.loading;
export const selectCustomersError = (state: RootState) => state.customers.error;

// Filtered and sorted customers
export const selectFilteredCustomers = createSelector(
  [selectCustomers, selectCustomerFilters],
  (customers, filters) => {
    let filtered = customers.filter(customer => {
      const matchesSearch = !filters.searchTerm || 
        customer.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesSegment = filters.segment === 'all' || customer.segment === filters.segment;
      
      return matchesSearch && matchesSegment;
    });

    // Sort customers
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'totalSpent':
          aValue = parseFloat(a.totalSpent || '0');
          bValue = parseFloat(b.totalSpent || '0');
          break;
        case 'orderCount':
          aValue = a.orderCount || 0;
          bValue = b.orderCount || 0;
          break;
        case 'registrationDate':
          aValue = new Date(a.registrationDate || 0).getTime();
          bValue = new Date(b.registrationDate || 0).getTime();
          break;
        case 'rfmScore':
          aValue = a.rfmScore;
          bValue = b.rfmScore;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

    return filtered;
  }
);

// Reviews Selectors
export const selectReviews = (state: RootState) => state.reviews.reviews;
export const selectReviewAnalytics = (state: RootState) => state.reviews.analytics;
export const selectReviewFilters = (state: RootState) => state.reviews.filters;
export const selectReviewsLoading = (state: RootState) => state.reviews.loading;
export const selectReviewsError = (state: RootState) => state.reviews.error;

// Filtered and sorted reviews
export const selectFilteredReviews = createSelector(
  [selectReviews, selectReviewFilters],
  (reviews, filters) => {
    let filtered = reviews.filter(review => {
      const matchesSearch = !filters.searchTerm || 
        review.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        review.content?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        review.product?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesRating = filters.ratingFilter === 'all' || 
        (filters.ratingFilter === 'low' && review.rating <= 2) ||
        (filters.ratingFilter === 'high' && review.rating >= 4) ||
        review.rating.toString() === filters.ratingFilter;
      
      const matchesSentiment = filters.sentimentFilter === 'all' || review.sentiment === filters.sentimentFilter;
      
      return matchesSearch && matchesRating && matchesSentiment;
    });

    // Sort reviews
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'reviewDate':
          aValue = new Date(a.reviewDate || 0).getTime();
          bValue = new Date(b.reviewDate || 0).getTime();
          break;
        case 'sentiment':
          aValue = a.sentimentScore || 0;
          bValue = b.sentimentScore || 0;
          break;
        default:
          aValue = a.title || '';
          bValue = b.title || '';
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

    return filtered;
  }
);

// Marketing Selectors
export const selectMarketingCampaigns = (state: RootState) => state.marketing.campaigns;
export const selectMarketingAnalytics = (state: RootState) => state.marketing.analytics;
export const selectMarketingFilters = (state: RootState) => state.marketing.filters;
export const selectMarketingLoading = (state: RootState) => state.marketing.loading;
export const selectMarketingError = (state: RootState) => state.marketing.error;

// Filtered and sorted campaigns
export const selectFilteredCampaigns = createSelector(
  [selectMarketingCampaigns, selectMarketingFilters],
  (campaigns, filters) => {
    let filtered = campaigns.filter(campaign => {
      const matchesChannel = filters.channelFilter === 'all' || campaign.channel === filters.channelFilter;
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && campaign.isActive) ||
        (filters.statusFilter === 'inactive' && !campaign.isActive);
      
      return matchesChannel && matchesStatus;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'roi':
          aValue = a.roi;
          bValue = b.roi;
          break;
        case 'revenue':
          aValue = parseFloat(a.revenue || '0');
          bValue = parseFloat(b.revenue || '0');
          break;
        case 'spent':
          aValue = parseFloat(a.spent || '0');
          bValue = parseFloat(b.spent || '0');
          break;
        case 'conversions':
          aValue = a.conversions || 0;
          bValue = b.conversions || 0;
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

    return filtered;
  }
);

// Sentiment Selectors
export const selectSentimentRealTimeData = (state: RootState) => state.sentiment.realTimeData;
export const selectProductSentiments = (state: RootState) => state.sentiment.productSentiments;
export const selectSentimentAlerts = (state: RootState) => state.sentiment.alerts;
export const selectSentimentAnalytics = (state: RootState) => state.sentiment.analytics;
export const selectSentimentFilters = (state: RootState) => state.sentiment.filters;
export const selectSentimentLoading = (state: RootState) => state.sentiment.loading;
export const selectSentimentError = (state: RootState) => state.sentiment.error;
export const selectSentimentConnectionStatus = (state: RootState) => state.sentiment.isConnected;

// User Management Selectors
export const selectUsers = (state: RootState) => state.userManagement.users;
export const selectRoles = (state: RootState) => state.userManagement.roles;
export const selectSessions = (state: RootState) => state.userManagement.sessions;
export const selectUserAnalytics = (state: RootState) => state.userManagement.analytics;
export const selectUserFilters = (state: RootState) => state.userManagement.filters;
export const selectActiveTab = (state: RootState) => state.userManagement.activeTab;
export const selectUserManagementLoading = (state: RootState) => state.userManagement.loading;
export const selectUserManagementError = (state: RootState) => state.userManagement.error;

// Filtered and sorted users
export const selectFilteredUsers = createSelector(
  [selectUsers, selectUserFilters],
  (users, filters) => {
    let filtered = users.filter(user => {
      const matchesSearch = !filters.searchTerm || 
        user.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesRole = filters.roleFilter === 'all' || user.role === filters.roleFilter;
      const matchesStatus = filters.statusFilter === 'all' || user.status === filters.statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'lastLoginAt':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'username':
          aValue = a.username;
          bValue = b.username;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

    return filtered;
  }
);

// Auth Selectors
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectLoginLoading = (state: RootState) => state.auth.loginLoading;
export const selectRegisterLoading = (state: RootState) => state.auth.registerLoading;
export const selectUserPermissions = (state: RootState) => state.auth.user?.permissions || [];

// Permission check selector
export const selectHasPermission = createSelector(
  [selectUserPermissions],
  (permissions) => (permission: string) => permissions.includes(permission)
);