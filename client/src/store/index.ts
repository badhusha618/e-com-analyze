import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import productsReducer from './slices/productsSlice';
import alertsReducer from './slices/alertsSlice';
import productsPageReducer from './slices/productsPageSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    products: productsReducer,
    alerts: alertsReducer,
    productsPage: productsPageReducer,
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
