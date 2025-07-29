import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import productsReducer from './slices/productsSlice';
import alertsReducer from './slices/alertsSlice';
import productsPageReducer from './slices/productsPageSlice';
import customersReducer from './slices/customersSlice';
import reviewsReducer from './slices/reviewsSlice';
import marketingReducer from './slices/marketingSlice';
import sentimentReducer from './slices/sentimentSlice';
import userManagementReducer from './slices/userManagementSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    products: productsReducer,
    alerts: alertsReducer,
    productsPage: productsPageReducer,
    customers: customersReducer,
    reviews: reviewsReducer,
    marketing: marketingReducer,
    sentiment: sentimentReducer,
    userManagement: userManagementReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
