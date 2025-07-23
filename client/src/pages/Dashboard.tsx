import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchDashboardMetrics, fetchSalesData } from '@/store/slices/dashboardSlice';
import { fetchTopProducts } from '@/store/slices/productsSlice';
import { fetchAlerts } from '@/store/slices/alertsSlice';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import CustomerSentiment from '@/components/dashboard/CustomerSentiment';
import MarketingPerformance from '@/components/dashboard/MarketingPerformance';
import ProductPerformanceTable from '@/components/dashboard/ProductPerformanceTable';
import AlertsBar from '@/components/dashboard/AlertsBar';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { metrics, salesData, loading: dashboardLoading } = useSelector((state: RootState) => state.dashboard);
  const { topProducts, products, loading: productsLoading } = useSelector((state: RootState) => state.products);
  const { alerts } = useSelector((state: RootState) => state.alerts);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
    dispatch(fetchSalesData());
    dispatch(fetchTopProducts(4));
    dispatch(fetchAlerts());
  }, [dispatch]);

  if (dashboardLoading || !metrics) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AlertsBar alerts={alerts} />
      
      <MetricsGrid metrics={metrics} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <SalesChart data={salesData} />
        <TopProducts products={topProducts} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CustomerSentiment />
        <MarketingPerformance campaigns={metrics?.campaigns || []} />
      </div>
      
      <ProductPerformanceTable products={products.slice(0, 10)} />
    </div>
  );
}
