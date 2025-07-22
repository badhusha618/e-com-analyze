import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@shared/schema';

interface TopProductsProps {
  products: Product[];
}

const TopProducts = memo(({ products }: TopProductsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => {
            const sales = Math.floor(Math.random() * 1000 + 500); // Mock sales data
            const revenue = parseFloat(product.price) * sales;
            const growth = (Math.random() * 30 - 5).toFixed(1); // Mock growth data
            const isPositive = parseFloat(growth) > 0;

            return (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sales.toLocaleString()} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${revenue.toLocaleString()}
                  </p>
                  <p className={cn(
                    'text-xs flex items-center',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {growth}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 border-primary text-primary hover:bg-primary/5"
        >
          View All Products
        </Button>
      </CardContent>
    </Card>
  );
});

TopProducts.displayName = 'TopProducts';

export default TopProducts;
