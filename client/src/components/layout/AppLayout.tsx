import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Skeleton } from '@/components/ui/skeleton';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
}

export default function AppLayout({ children, title, loading = false }: AppLayoutProps) {
  const { alerts } = useSelector((state: RootState) => state.alerts);
  const unreadAlertsCount = alerts.filter(alert => !alert.isRead).length;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar unreadAlerts={unreadAlertsCount} title={title} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar unreadAlerts={unreadAlertsCount} title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}