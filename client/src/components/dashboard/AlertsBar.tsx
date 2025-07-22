import { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markAlertAsRead } from '@/store/slices/alertsSlice';
import type { AppDispatch } from '@/store';
import type { Alert as AlertType } from '@shared/schema';

interface AlertsBarProps {
  alerts: AlertType[];
}

const AlertsBar = memo(({ alerts }: AlertsBarProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const unreadAlerts = alerts.filter(alert => !alert.isRead).slice(0, 3);

  if (unreadAlerts.length === 0) {
    return null;
  }

  const handleDismiss = (alertId: number) => {
    dispatch(markAlertAsRead(alertId));
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return AlertCircle;
      case 'medium':
      case 'low':
      default:
        return AlertTriangle;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-4 mb-4">
        {unreadAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.severity);
          const alertStyle = getAlertStyle(alert.severity);

          return (
            <Alert key={alert.id} className={cn('flex items-center', alertStyle)}>
              <Icon className="w-5 h-5 mr-2" />
              <AlertDescription className="flex-1 text-sm">
                {alert.message}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-1"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </Alert>
          );
        })}
      </div>
    </div>
  );
});

AlertsBar.displayName = 'AlertsBar';

export default AlertsBar;
