import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calculator, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor: string;
  iconColor: string;
}

const MetricCard = memo(({ label, value, change, changeType, icon: Icon, iconBgColor, iconColor }: MetricCardProps) => {
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-sm flex items-center',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <ChangeIcon className="w-4 h-4 mr-1" />
                <span>{change}%</span>
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconBgColor)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

interface MetricsGridProps {
  metrics: {
    totalSales: string;
    totalOrders: string;
    avgOrderValue: string;
    returnRate: string;
    salesChange: string;
    ordersChange: string;
    aovChange: string;
    returnRateChange: string;
  };
}

const MetricsGrid = memo(({ metrics }: MetricsGridProps) => {
  const metricCards = [
    {
      label: 'Total Sales',
      value: metrics.totalSales,
      change: metrics.salesChange,
      changeType: parseFloat(metrics.salesChange) >= 0 ? 'positive' : 'negative' as const,
      icon: DollarSign,
      iconBgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Orders',
      value: metrics.totalOrders,
      change: metrics.ordersChange,
      changeType: parseFloat(metrics.ordersChange) >= 0 ? 'positive' : 'negative' as const,
      icon: ShoppingCart,
      iconBgColor: 'bg-secondary/10',
      iconColor: 'text-secondary',
    },
    {
      label: 'Avg Order Value',
      value: metrics.avgOrderValue,
      change: metrics.aovChange,
      changeType: parseFloat(metrics.aovChange) >= 0 ? 'positive' : 'negative' as const,
      icon: Calculator,
      iconBgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Return Rate',
      value: metrics.returnRate,
      change: metrics.returnRateChange,
      changeType: parseFloat(metrics.returnRateChange) <= 0 ? 'positive' : 'negative' as const,
      icon: RotateCcw,
      iconBgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric) => (
        <MetricCard
          key={metric.label}
          {...metric}
        />
      ))}
    </div>
  );
});

MetricsGrid.displayName = 'MetricsGrid';

export default MetricsGrid;
