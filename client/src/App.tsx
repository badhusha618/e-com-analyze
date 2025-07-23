import { Switch, Route } from "wouter";
import { Provider } from "react-redux";
import { store } from "@/store";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import ProductsPage from "@/pages/ProductsPage";
import CustomersPage from "@/pages/CustomersPage";
import ReviewsPage from "@/pages/ReviewsPage";
import MarketingPage from "@/pages/MarketingPage";
import AlertsPage from "@/pages/AlertsPage";
import SentimentPage from "@/pages/SentimentPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import UserManagementPage from "@/pages/UserManagementPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      {/* Protected routes */}
      <Route path="/">
        {user ? (
          <ProtectedRoute>
            <AppLayout title="Dashboard">
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )}
      </Route>
      
      <Route path="/products">
        <ProtectedRoute>
          <AppLayout title="Products">
            <ProductsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/customers">
        <ProtectedRoute>
          <AppLayout title="Customers">
            <CustomersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/reviews">
        <ProtectedRoute>
          <AppLayout title="Reviews">
            <ReviewsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/marketing">
        <ProtectedRoute>
          <AppLayout title="Marketing">
            <MarketingPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/alerts">
        <ProtectedRoute>
          <AppLayout title="Alerts">
            <AlertsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/sentiment">
        <ProtectedRoute>
          <AppLayout title="Sentiment Analysis">
            <SentimentPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute>
          <AppLayout title="User Management">
            <UserManagementPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
