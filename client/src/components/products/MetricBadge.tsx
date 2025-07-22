import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const MetricBadge = memo(({
  label,
  value,
  variant = 'secondary',
  size = 'md',
  color = 'gray',
  icon: Icon,
  className
}: MetricBadgeProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-2';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1.5';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <Badge
        variant={variant}
        className={cn(
          'flex items-center gap-1 font-semibold',
          getSizeClasses(),
          variant === 'outline' && getColorClasses()
        )}
      >
        {Icon && <Icon className="w-3 h-3" />}
        <span>{value}</span>
      </Badge>
    </div>
  );
});

MetricBadge.displayName = 'MetricBadge';

export default MetricBadge;