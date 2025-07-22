import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import MetricBadge from './MetricBadge';
import type { EnrichedProduct } from '@/store/slices/productsPageSlice';

interface ProductCardProps {
  product: EnrichedProduct;
  onClick: (product: EnrichedProduct) => void;
  isSelected?: boolean;
}

const ProductCard = memo(({ product, onClick, isSelected = false }: ProductCardProps) => {
  const { analytics } = product;

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getABCClassificationColor = (classification: 'A' | 'B' | 'C') => {
    switch (classification) {
      case 'A': return 'green';
      case 'B': return 'yellow';
      case 'C': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getInventoryStatus = (inventory: number): { label: string; color: 'red' | 'yellow' | 'green' | 'gray' | 'blue' | 'purple' } => {
    if (inventory < 20) return { label: 'Low Stock', color: 'red' };
    if (inventory < 50) return { label: 'Medium Stock', color: 'yellow' };
    return { label: 'In Stock', color: 'green' };
  };

  const inventoryStatus = getInventoryStatus(product.inventory);

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
      onClick={() => onClick(product)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'font-semibold',
              `bg-${getABCClassificationColor(analytics.abcClassification)}-100 text-${getABCClassificationColor(analytics.abcClassification)}-800`
            )}
          >
            Class {analytics.abcClassification}
          </Badge>
        </div>

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {parseFloat(product.rating || '0').toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <MetricBadge
            label="Sales Volume"
            value={formatNumber(analytics.totalSales)}
            color="blue"
            icon={Package}
            variant="outline"
          />
          <MetricBadge
            label="Revenue"
            value={formatCurrency(analytics.revenue)}
            color="green"
            icon={DollarSign}
            variant="outline"
          />
        </div>

        {/* Health Score and Inventory */}
        <div className="flex items-center justify-between mb-4">
          <MetricBadge
            label="Health Score"
            value={`${analytics.healthScore}/100`}
            color={getHealthScoreColor(analytics.healthScore)}
            variant="outline"
            size="lg"
          />
          <MetricBadge
            label="Inventory"
            value={formatNumber(product.inventory)}
            color={inventoryStatus.color}
            variant="outline"
          />
        </div>

        {/* Sales Trend Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Sales Trend</span>
          <div className="flex items-center gap-1">
            {/* Simple trend calculation based on last few days */}
            {analytics.salesTrend.length > 5 && (
              <>
                {analytics.salesTrend.slice(-3).reduce((sum, day) => sum + day.sales, 0) >
                 analytics.salesTrend.slice(-6, -3).reduce((sum, day) => sum + day.sales, 0) ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Trending Up</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Trending Down</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Inventory Status Indicator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Inventory Status</span>
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                `bg-${inventoryStatus.color}-100 text-${inventoryStatus.color}-800`
              )}
            >
              {inventoryStatus.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;