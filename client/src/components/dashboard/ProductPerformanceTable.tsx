import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@shared/schema';

interface ProductPerformanceTableProps {
  products: Product[];
}

const ProductPerformanceTable = memo(({ products }: ProductPerformanceTableProps) => {
  const getPerformanceStatus = (rating: string, inventory: number) => {
    const ratingNum = parseFloat(rating || '0');
    if (ratingNum >= 4.5 && inventory > 50) {
      return { label: 'High Performer', variant: 'default' as const, className: 'bg-green-100 text-green-800' };
    } else if (ratingNum >= 3.5 && inventory > 20) {
      return { label: 'Good', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' };
    } else if (ratingNum >= 2.5) {
      return { label: 'Average', variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Needs Attention', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' };
    }
  };

  const calculateProfitMargin = (price: string, costPrice: string) => {
    const priceNum = parseFloat(price);
    const costNum = parseFloat(costPrice);
    if (priceNum === 0) return 0;
    return ((priceNum - costNum) / priceNum * 100).toFixed(0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Product Performance Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit Margin
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = getPerformanceStatus(product.rating || '0', product.inventory);
                const profitMargin = calculateProfitMargin(product.price, product.costPrice);
                const mockSales = Math.floor(Math.random() * 1000 + 200);
                const revenue = parseFloat(product.price) * mockSales;

                return (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {mockSales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      ${revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {profitMargin}%
                    </TableCell>
                    <TableCell className={cn(
                      'text-sm',
                      product.inventory < 20 ? 'text-red-600' : 'text-gray-900'
                    )}>
                      {product.inventory}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                        <span className="text-sm text-gray-900">
                          {parseFloat(product.rating || '0').toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{products.length}</span> of{' '}
            <span className="font-medium">{products.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductPerformanceTable.displayName = 'ProductPerformanceTable';

export default ProductPerformanceTable;
