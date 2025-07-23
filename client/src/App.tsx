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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/reviews" component={ReviewsPage} />
      <Route path="/marketing" component={MarketingPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
